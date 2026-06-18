package com.lifemate.backend.dto;

public record SecurityInfoResponse(
        boolean emailVerified,
        boolean phoneVerified,
        String phoneNumberMasked
) {}
