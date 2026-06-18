package com.lifemate.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LifestyleRequest {

    @NotNull
    @Min(1) @Max(5)
    private Integer mood;

    @NotNull
    @Min(1) @Max(5)
    private Integer workload;

    @NotNull
    @Min(0) @Max(12)
    private Double sleepHours;

    @NotNull
    @Min(1) @Max(5)
    private Integer energyLevel;

    @Min(1) @Max(5)
    private Integer socialInteraction = 3;

    @Min(0) @Max(1)
    private Integer exerciseDone = 0;

    @Min(0)
    private Double screenTimeHours = 4.0;

    @Min(0)
    private Double waterCups = 6.0;
}
