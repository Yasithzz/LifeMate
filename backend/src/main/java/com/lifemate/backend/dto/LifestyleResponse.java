package com.lifemate.backend.dto;

import java.time.Instant;

public record LifestyleResponse(
        String id,
        int mood,
        int workload,
        double sleepHours,
        int energyLevel,
        int socialInteraction,
        int exerciseDone,
        double screenTimeHours,
        double waterCups,
        String stressLevel,
        int stressIndex,
        int predictionScore,
        Instant submittedAt
) {}
