package com.lifemate.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddPhoneRequest {
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+[1-9]\\d{6,14}$", message = "Phone number must be in E.164 format (e.g. +94771234567)")
    private String phoneNumber;
}
