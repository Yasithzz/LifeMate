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

    public MlService(@Value("${ml.service.url:http://localhost:5001}") String mlUrl) {
        this.mlUrl = mlUrl;
    }

    public record MlResult(String stressLevel, int stressIndex, int legacyScore) {}

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
                    log.info("ML prediction: {} ({})", lbl, idx);
                    return new MlResult(lbl, idx, idx * 25);
                }
            }
        } catch (Exception e) {
            log.warn("ML service unavailable ({}), using fallback heuristic", e.getMessage());
        }
        return fallback(req);
    }

    /** Heuristic fallback when Python service is not running */
    private MlResult fallback(LifestyleRequest req) {
        double score =
            (5 - req.getMood())    * 0.25 +
            (req.getWorkload()-1)  * 0.22 +
            Math.max(0, 7.5 - req.getSleepHours()) / 7.5 * 0.20 +
            (5 - req.getEnergyLevel()) / 4.0 * 0.18 +
            ((req.getSocialInteraction() != null ? 3 - req.getSocialInteraction() : 0) / 4.0) * 0.06 +
            (req.getExerciseDone() != null && req.getExerciseDone() == 0 ? 1 : 0) * 0.05 +
            ((req.getScreenTimeHours() != null ? req.getScreenTimeHours() : 4) / 14.0) * 0.04;

        int idx;
        if (score < 0.18)      idx = 0;
        else if (score < 0.36) idx = 1;
        else if (score < 0.58) idx = 2;
        else if (score < 0.76) idx = 3;
        else                   idx = 4;

        return new MlResult(LABELS.get(idx), idx, idx * 25);
    }

    /** Asynchronously send confirmed data back to ML service for incremental retraining */
    public void sendTrainingData(LifestyleRequest req, int confirmedIndex) {
        try {
            String json = buildJson(req, confirmedIndex);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(mlUrl + "/add-data"))
                    .header("Content-Type","application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .timeout(Duration.ofSeconds(3))
                    .build();
            http.sendAsync(request, HttpResponse.BodyHandlers.discarding());
        } catch (Exception e) {
            log.debug("Could not send training data to ML service: {}", e.getMessage());
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
