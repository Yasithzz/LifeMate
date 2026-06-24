package com.lifemate.backend.dto;

import java.util.List;

public record ProfileResponse(
        String id,
        String fullName,
        String email,
        String role,
        String sleepSchedule,
        String wakeTime,
        String workHours,
        String mealPreference,
        String workoutPreference,
        String freeTimePreference,
        Boolean reminderPreference,
        List<String> workingDays
) {}
