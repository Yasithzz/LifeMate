package com.lifemate.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProfileRequest {
    private String fullName;
    private String avatarBase64;
    private String sleepSchedule;
    private String wakeTime;
    private String workHours;
    private String mealPreference;
    private String workoutPreference;
    private String freeTimePreference;
    private Boolean reminderPreference;
    private List<String> workingDays;
}
