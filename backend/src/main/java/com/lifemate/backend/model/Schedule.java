package com.lifemate.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Document(collection = "schedules")
public class Schedule {

    @Id
    private String id;

    @Indexed
    private String userEmail;

    private String scheduleDate;
    private String status = "active";
    private List<ScheduleItem> items = new ArrayList<>();
    private Instant createdAt = Instant.now();

    @Getter
    @Setter
    public static class ScheduleItem {
        private String itemId;
        private String title;
        private String startTime;
        private String endTime;
        private String activityType;
        private String status = "pending";
    }
}
