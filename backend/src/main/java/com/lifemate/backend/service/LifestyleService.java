package com.lifemate.backend.service;

import com.lifemate.backend.dto.LifestyleRequest;
import com.lifemate.backend.dto.LifestyleResponse;
import com.lifemate.backend.model.LifestyleEntry;
import com.lifemate.backend.model.Notification;
import com.lifemate.backend.model.User;
import com.lifemate.backend.repository.LifestyleRepository;
import com.lifemate.backend.repository.NotificationRepository;
import com.lifemate.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class LifestyleService {

    private final LifestyleRepository lifestyleRepository;
    private final NotificationRepository notificationRepository;
    private final MlService mlService;
    private final WeeklyScheduleService weeklyScheduleService;
    private final UserRepository userRepository;

    public LifestyleService(LifestyleRepository lifestyleRepository,
                            NotificationRepository notificationRepository,
                            MlService mlService,
                            WeeklyScheduleService weeklyScheduleService,
                            UserRepository userRepository) {
        this.lifestyleRepository = lifestyleRepository;
        this.notificationRepository = notificationRepository;
        this.mlService = mlService;
        this.weeklyScheduleService = weeklyScheduleService;
        this.userRepository = userRepository;
    }

    public LifestyleResponse submit(String userEmail, LifestyleRequest req) {
        // ── ML prediction ──────────────────────────────────────────
        MlService.MlResult result = mlService.predict(req);

        // ── Persist lifestyle entry ─────────────────────────────────
        LifestyleEntry entry = new LifestyleEntry();
        entry.setUserEmail(userEmail);
        entry.setMood(req.getMood());
        entry.setWorkload(req.getWorkload());
        entry.setSleepHours(req.getSleepHours());
        entry.setEnergyLevel(req.getEnergyLevel());
        entry.setSocialInteraction(req.getSocialInteraction() != null ? req.getSocialInteraction() : 3);
        entry.setExerciseDone(req.getExerciseDone() != null ? req.getExerciseDone() : 0);
        entry.setScreenTimeHours(req.getScreenTimeHours() != null ? req.getScreenTimeHours() : 4.0);
        entry.setWaterCups(req.getWaterCups() != null ? req.getWaterCups() : 6.0);
        entry.setStressLevel(result.stressLevel());
        entry.setStressIndex(result.stressIndex());
        entry.setPredictionScore(result.legacyScore());

        LifestyleEntry saved = lifestyleRepository.save(entry);

        // ── Notification (immediate) ────────────────────────────────
        Notification n = new Notification();
        n.setUserEmail(userEmail);
        n.setMessage("ML Stress Analysis complete — Level: " + saved.getStressLevel()
                + ". Your personalised weekly schedule has been refreshed!");
        n.setType("analysis");
        notificationRepository.save(n);

        // ── Schedule generation + ML training data (async via virtual thread) ──
        final String email  = userEmail;
        final var    res    = result;
        final var    reqCopy = req;
        Thread.ofVirtual().start(() -> {
            try {
                User u = userRepository.findByEmail(email).orElse(new User());
                weeklyScheduleService.generateForCurrentWeek(email, res.stressIndex(), res.stressLevel(), u);
            } catch (Exception ignored) {}
            mlService.sendTrainingData(reqCopy, res.stressIndex());
        });

        return toResponse(saved);
    }

    public List<LifestyleResponse> getHistory(String userEmail) {
        return lifestyleRepository.findByUserEmailOrderBySubmittedAtDesc(userEmail)
                .stream().map(this::toResponse).toList();
    }

    public Optional<LifestyleResponse> getToday(String userEmail) {
        Instant start = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant end   = start.plus(1, ChronoUnit.DAYS);
        return lifestyleRepository
                .findTopByUserEmailAndSubmittedAtBetweenOrderBySubmittedAtDesc(userEmail, start, end)
                .map(this::toResponse);
    }

    public Optional<LifestyleResponse> getLatest(String userEmail) {
        return lifestyleRepository.findTopByUserEmailOrderBySubmittedAtDesc(userEmail)
                .map(this::toResponse);
    }

    private LifestyleResponse toResponse(LifestyleEntry e) {
        return new LifestyleResponse(
                e.getId(), e.getMood(), e.getWorkload(), e.getSleepHours(), e.getEnergyLevel(),
                e.getSocialInteraction(), e.getExerciseDone(), e.getScreenTimeHours(), e.getWaterCups(),
                e.getStressLevel(), e.getStressIndex(), e.getPredictionScore(), e.getSubmittedAt());
    }
}
