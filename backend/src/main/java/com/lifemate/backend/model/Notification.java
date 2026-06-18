package com.lifemate.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userEmail;

    private String message;
    private String type = "info";
    private boolean isRead = false;
    private Instant createdAt = Instant.now();
}
