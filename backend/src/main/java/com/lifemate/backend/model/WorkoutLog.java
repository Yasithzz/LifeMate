package com.lifemate.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "workout_logs")
public class WorkoutLog {

    @Id
    private String id;

    @Indexed
    private String userEmail;

    private String workoutType;
    private int durationMinutes;
    private Instant recordedAt = Instant.now();
}
