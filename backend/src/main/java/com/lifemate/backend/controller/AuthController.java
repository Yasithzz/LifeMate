package com.lifemate.backend.controller;

import com.lifemate.backend.dto.AuthResponse;
import com.lifemate.backend.dto.ForgotPasswordInitRequest;
import com.lifemate.backend.dto.ForgotPasswordResetRequest;
import com.lifemate.backend.dto.LoginRequest;
import com.lifemate.backend.dto.RegisterRequest;
import com.lifemate.backend.service.AuthService;
import com.lifemate.backend.service.SecurityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SecurityService securityService;

    public AuthController(AuthService authService, SecurityService securityService) {
        this.authService = authService;
        this.securityService = securityService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password/initiate")
    public ResponseEntity<Map<String, String>> forgotPasswordInitiate(@Valid @RequestBody ForgotPasswordInitRequest req) {
        securityService.initiateForgotPassword(req.getEmail(), req.getMethod());
        return ResponseEntity.ok(Map.of("message", "OTP sent. Check your " + ("phone".equals(req.getMethod()) ? "phone" : "email") + "."));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, String>> forgotPasswordReset(@Valid @RequestBody ForgotPasswordResetRequest req) {
        securityService.resetPassword(req.getEmail(), req.getOtp(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
    }
}
