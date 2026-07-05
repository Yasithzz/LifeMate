package com.lifemate.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    @Indexed
    private String userEmail;

    private String title;
    private String category = "Work";
    private String priority = "Medium";
    private String status = "Pending";
    private String deadline;
    private String deadlineTime;
    private Integer durationMinutes;

    private Instant createdAt = Instant.now();
    private Instant completedAt;
}
