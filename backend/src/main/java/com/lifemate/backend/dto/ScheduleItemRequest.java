package com.lifemate.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScheduleItemRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String startTime;
    @NotBlank
    private String endTime;
    private String activityType = "Work";
    private String status = "pending";
}
