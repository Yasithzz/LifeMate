package com.lifemate.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileRequest {
    private String sleepSchedule;
    private String wakeTime;
    private String workHours;
    private String mealPreference;
    private String workoutPreference;
    private String freeTimePreference;
    private Boolean reminderPreference;
}
