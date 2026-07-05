package com.lifemate.backend.service;

import com.lifemate.backend.dto.LifestyleRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MlService {

    private static final Logger log = LoggerFactory.getLogger(MlService.class);
    private static final List<String> LABELS = List.of("Very Low","Low","Normal","High","Very High");

    private static final Pattern IDX_PAT = Pattern.compile("\"stress_level\"\\s*:\\s*(\\d+)");
    private static final Pattern LBL_PAT = Pattern.compile("\"stress_label\"\\s*:\\s*\"([^\"]+)\"");

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(1))
            .build();
    private final String mlUrl;
    private final String datasetPath;

    public MlService(
            @Value("${ml.service.url:http://localhost:5001}") String mlUrl,
            @Value("${ml.dataset.path:../datasets/stress_dataset.csv}") String datasetPath) {
        this.mlUrl = mlUrl;
        this.datasetPath = datasetPath;
    }

    public record MlResult(String stressLevel, int stressIndex, int legacyScore, int confidence) {}

    public MlResult predict(LifestyleRequest req) {
        try {
            String json = buildJson(req, null);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(mlUrl + "/predict"))
                    .header("Content-Type","application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .timeout(Duration.ofSeconds(2))
                    .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                String body = response.body();
                Matcher mi = IDX_PAT.matcher(body);
                Matcher ml = LBL_PAT.matcher(body);
                if (mi.find() && ml.find()) {
                    int    idx = Integer.parseInt(mi.group(1));
                    String lbl = ml.group(1);
                    // Extract probability for the predicted label from probabilities map
                    Pattern confPat = Pattern.compile("\"" + Pattern.quote(lbl) + "\"\\s*:\\s*(\\d+(?:\\.\\d+)?)");
                    Matcher mc = confPat.matcher(body);
                    int confidence = mc.find() ? (int) Math.round(Double.parseDouble(mc.group(1)) * 100) : 50;
                    log.info("ML prediction: {} ({}) confidence={}%", lbl, idx, confidence);
                    return new MlResult(lbl, idx, idx * 25, confidence);
                }
            }
        } catch (Exception e) {
            log.warn("ML service unavailable ({}), using fallback heuristic", e.getMessage());
        }
        return fallback(req);
    }

    
    private MlResult fallback(LifestyleRequest req) {
        double mood     = (5.0 - req.getMood())         / 4.0;   // normalize 1-5 → 0-1
        double workload = (req.getWorkload() - 1.0)     / 4.0;   // normalize 1-5 → 0-1
        double sleep    = Math.max(0, 7.5 - req.getSleepHours()) / 7.5;
        double energy   = (5.0 - req.getEnergyLevel())  / 4.0;
        double social   = (req.getSocialInteraction() != null ? 3.0 - req.getSocialInteraction() : 0) / 4.0;
        double exercise = (req.getExerciseDone() != null && req.getExerciseDone() == 0) ? 1.0 : 0.0;
        double screen   = Math.min(1.0, (req.getScreenTimeHours() != null ? req.getScreenTimeHours() : 4.0) / 10.0);

        double score = mood     * 0.25
                     + workload * 0.22
                     + sleep    * 0.20
                     + energy   * 0.18
                     + social   * 0.06
                     + exercise * 0.05
                     + screen   * 0.04;

        int idx;
        if (score < 0.18)      idx = 0;

        else if (score < 0.36) idx = 1;
        else if (score < 0.58) idx = 2;
        else if (score < 0.76) idx = 3;
        else                   idx = 4;

        // Pseudo-confidence: how far the score is from the nearest decision boundary within its bucket
        double[] bounds = {0.0, 0.18, 0.36, 0.58, 0.76, 1.0};
        double lo = bounds[idx], hi = bounds[idx + 1];
        double pos = (score - lo) / (hi - lo); // 0..1 within bucket
        double relConf = 1.0 - 2.0 * Math.abs(pos - 0.5); // peaks at center
        int confidence = 50 + (int) Math.round(relConf * 40); // 50-90%

        log.debug("Fallback heuristic score={} → {} confidence={}%", String.format("%.4f", score), LABELS.get(idx), confidence);
        return new MlResult(LABELS.get(idx), idx, idx * 25, confidence);
    }

   
    
    public void sendTrainingData(LifestyleRequest req, int confirmedIndex) {
        try {
            String json = buildJson(req, confirmedIndex);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(mlUrl + "/add-data"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .timeout(Duration.ofSeconds(5))
                    .build();
            HttpResponse<String> resp = http.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Training data sent to ML service (status {}): {}", resp.statusCode(), resp.body());
        } catch (Exception e) {
            log.warn("ML service unavailable for /add-data ({}). Writing directly to dataset CSV.", e.getMessage());
            writeDirectlyToCsv(req, confirmedIndex);
        }
    }

    private void writeDirectlyToCsv(LifestyleRequest req, int stressIndex) {
        try {
            int social = req.getSocialInteraction() != null ? req.getSocialInteraction() : 3;
            int ex     = req.getExerciseDone()       != null ? req.getExerciseDone()      : 0;
            double scr = req.getScreenTimeHours()    != null ? req.getScreenTimeHours()   : 4.0;
            double wat = req.getWaterCups()          != null ? req.getWaterCups()         : 6.0;

            Path csv = Paths.get(datasetPath).toAbsolutePath().normalize();
            boolean isNew = !Files.exists(csv);
            if (isNew) {
                Files.createDirectories(csv.getParent());
                Files.writeString(csv,
                    "mood,workload,sleep_hours,energy_level,social_interaction,exercise_done,screen_time_hours,water_cups,stress_level\n",
                    StandardOpenOption.CREATE);
            }
            String row = String.format("%d,%d,%.1f,%d,%d,%d,%.1f,%.1f,%d%n",
                    req.getMood(), req.getWorkload(), req.getSleepHours(),
                    req.getEnergyLevel(), social, ex, scr, wat, stressIndex);
            Files.writeString(csv, row, StandardOpenOption.APPEND);
            log.info("Training data written directly to {}", csv);
        } catch (Exception ex) {
            log.error("Could not write training data to CSV: {}", ex.getMessage());
        }
    }

    private String buildJson(LifestyleRequest req, Integer stressIndex) {
        int social  = req.getSocialInteraction() != null ? req.getSocialInteraction() : 3;
        int ex      = req.getExerciseDone()       != null ? req.getExerciseDone()      : 0;
        double scr  = req.getScreenTimeHours()    != null ? req.getScreenTimeHours()   : 4.0;
        double wat  = req.getWaterCups()          != null ? req.getWaterCups()         : 6.0;

        StringBuilder sb = new StringBuilder("{");
        sb.append("\"mood\":").append(req.getMood()).append(",");
        sb.append("\"workload\":").append(req.getWorkload()).append(",");
        sb.append("\"sleep_hours\":").append(req.getSleepHours()).append(",");
        sb.append("\"energy_level\":").append(req.getEnergyLevel()).append(",");
        sb.append("\"social_interaction\":").append(social).append(",");
        sb.append("\"exercise_done\":").append(ex).append(",");
        sb.append("\"screen_time_hours\":").append(scr).append(",");
        sb.append("\"water_cups\":").append(wat);
        if (stressIndex != null) sb.append(",\"stress_level\":").append(stressIndex);
        sb.append("}");
        return sb.toString();
    }
}
