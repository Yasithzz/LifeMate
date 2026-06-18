package com.lifemate.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkoutRequest {
    @NotBlank
    private String workoutType;

    @NotNull
    @Min(1)
    private Integer durationMinutes;
}
