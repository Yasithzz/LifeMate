package com.lifemate.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "lifestyle_data")
public class LifestyleEntry {

    @Id
    private String id;

    @Indexed
    private String userEmail;

    private int mood;
    private int workload;
    private double sleepHours;
    private int energyLevel;
    private int socialInteraction = 3;
    private int exerciseDone = 0;
    private double screenTimeHours = 4.0;
    private double waterCups = 6.0;

    private String stressLevel;   // "Very Low" | "Low" | "Normal" | "High" | "Very High"
    private int stressIndex;       // 0-4
    private int predictionScore;   // legacy 0-100

    private Instant submittedAt = Instant.now();
}
