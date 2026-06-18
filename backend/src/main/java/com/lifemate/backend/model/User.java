package com.lifemate.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Role role = Role.USER;

    private Instant createdAt = Instant.now();

    // Profile preferences
    private String sleepSchedule = "22:30";
    private String wakeTime = "07:00";
    private String workHours = "09:00-17:00";
    private String mealPreference = "Balanced";
    private String workoutPreference = "Moderate";
    private String freeTimePreference = "Reading";
    private Boolean reminderPreference = true;

    // Security
    private boolean emailVerified = false;
    private String phoneNumber;
    private boolean phoneVerified = false;
}
