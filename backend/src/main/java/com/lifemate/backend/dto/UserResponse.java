package com.lifemate.backend.dto;

import java.time.Instant;

public record UserResponse(
        String id,
        String fullName,
        String email,
        String role,
        Instant createdAt,
        Instant lastLoginAt,
        int loginCount
) {}
