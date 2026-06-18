package com.lifemate.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordInitRequest {
    @NotBlank @Email
    private String email;
    /** "email" or "phone" */
    private String method = "email";
}
