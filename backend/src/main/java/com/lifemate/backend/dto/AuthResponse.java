package com.lifemate.backend.dto;

public record AuthResponse(String id, String fullName, String email, String role, String token) {
}
