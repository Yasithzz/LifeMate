package com.lifemate.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OtpVerifyRequest {
    @NotBlank(message = "OTP is required")
    private String otp;
}
