package com.lifemate.backend.dto;

import java.time.Instant;

public record TaskResponse(
        String id,
        String title,
        String category,
        String priority,
        String status,
        String deadline,
        String deadlineTime,
        Integer durationMinutes,
        Instant createdAt,
        Instant completedAt
) {}
