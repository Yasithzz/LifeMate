package com.lifemate.backend.dto;

import java.time.Instant;
import java.util.List;

public record WellnessResponse(
        int todayWater,
        List<WaterEntry> waterHistory,
        List<WorkoutEntry> workoutHistory
) {
    public record WaterEntry(String id, int amount, Instant recordedAt) {}
    public record WorkoutEntry(String id, String workoutType, int durationMinutes, Instant recordedAt) {}
}
