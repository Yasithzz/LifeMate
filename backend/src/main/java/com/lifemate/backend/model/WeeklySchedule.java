package com.lifemate.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Document(collection = "weekly_schedules")
public class WeeklySchedule {

    @Id
    private String id;

    @Indexed
    private String userEmail;

    private String weekStartDate;  // Monday YYYY-MM-DD

    private String stressLevel;    // "Very Low" | "Low" | "Normal" | "High" | "Very High"
    private int stressIndex;        // 0-4

    /** key = "MONDAY" … "SUNDAY", value = ordered list of slots */
    private Map<String, List<DaySlot>> days = new LinkedHashMap<>();

    /** YYYY-MM-DD dates that are holidays/leaves — skipped in schedule */
    private List<String> leaveDays = new ArrayList<>();

    private Instant generatedAt = Instant.now();
    private boolean userModified = false;

    @Getter @Setter
    public static class DaySlot {
        private String startTime;
        private String endTime;
        private String activityType;  // Work | Exercise | Meal | Break | Sleep | Leisure | Study | Meeting | Other
        private String title;
        private String status = "pending"; // "pending" | "completed" | "skipped"
        private String itemId;
    }
}
