package com.lifemate.backend.dto;

import java.time.Instant;

public record NotificationResponse(
        String id,
        String message,
        String type,
        boolean isRead,
        Instant createdAt
) {}
