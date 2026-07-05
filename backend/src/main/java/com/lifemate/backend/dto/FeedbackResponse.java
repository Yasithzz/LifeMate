package com.lifemate.backend.dto;

import java.time.Instant;

public record FeedbackResponse(String id, String userName, String message, int rating, Instant createdAt) {}
