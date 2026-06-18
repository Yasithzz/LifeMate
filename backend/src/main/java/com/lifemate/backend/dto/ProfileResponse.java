package com.lifemate.backend.dto;

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
        Boolean reminderPreference
) {}
