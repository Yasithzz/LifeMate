package com.lifemate.backend.service;

import com.lifemate.backend.dto.WaterRequest;
import com.lifemate.backend.dto.WellnessResponse;
import com.lifemate.backend.dto.WorkoutRequest;
import com.lifemate.backend.model.WaterIntake;
import com.lifemate.backend.model.WorkoutLog;
import com.lifemate.backend.repository.WaterIntakeRepository;
import com.lifemate.backend.repository.WorkoutLogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class WellnessService {

    private final WaterIntakeRepository waterRepo;
    private final WorkoutLogRepository workoutRepo;

    public WellnessService(WaterIntakeRepository waterRepo, WorkoutLogRepository workoutRepo) {
        this.waterRepo = waterRepo;
        this.workoutRepo = workoutRepo;
    }

    public WellnessResponse getSummary(String userEmail) {
        Instant todayStart = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant todayEnd = todayStart.plus(1, ChronoUnit.DAYS);

        List<WaterIntake> todayWater = waterRepo.findByUserEmailAndRecordedAtBetweenOrderByRecordedAtDesc(userEmail, todayStart, todayEnd);
        int totalToday = todayWater.stream().mapToInt(w -> w.getAmount()).sum();

        List<WellnessResponse.WaterEntry> waterHistory = waterRepo.findByUserEmailOrderByRecordedAtDesc(userEmail)
                .stream().map(w -> new WellnessResponse.WaterEntry(w.getId(), w.getAmount(), w.getRecordedAt())).toList();

        List<WellnessResponse.WorkoutEntry> workoutHistory = workoutRepo.findByUserEmailOrderByRecordedAtDesc(userEmail)
                .stream().map(w -> new WellnessResponse.WorkoutEntry(w.getId(), w.getWorkoutType(), w.getDurationMinutes(), w.getRecordedAt())).toList();

        return new WellnessResponse(totalToday, waterHistory, workoutHistory);
    }

    public void logWater(String userEmail, WaterRequest req) {
        WaterIntake w = new WaterIntake();
        w.setUserEmail(userEmail);
        w.setAmount(req.getAmount());
        waterRepo.save(w);
    }

    public void deleteWater(String userEmail, String id) {
        waterRepo.findById(id).ifPresent(w -> {
            if (w.getUserEmail().equals(userEmail)) waterRepo.delete(w);
        });
    }

    public void logWorkout(String userEmail, WorkoutRequest req) {
        WorkoutLog w = new WorkoutLog();
        w.setUserEmail(userEmail);
        w.setWorkoutType(req.getWorkoutType());
        w.setDurationMinutes(req.getDurationMinutes());
        workoutRepo.save(w);
    }

    public void deleteWorkout(String userEmail, String id) {
        workoutRepo.findById(id).ifPresent(w -> {
            if (w.getUserEmail().equals(userEmail)) workoutRepo.delete(w);
        });
    }
}
