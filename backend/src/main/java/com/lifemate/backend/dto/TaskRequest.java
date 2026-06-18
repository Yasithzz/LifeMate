package com.lifemate.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String category = "Work";
    private String priority = "Medium";
    private String status = "Pending";
    private String deadline;
    private Integer durationMinutes;
}
