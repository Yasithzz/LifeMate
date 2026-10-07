package com.lifemate.backend.controller;

import com.lifemate.backend.dto.AddPhoneRequest;
import com.lifemate.backend.dto.OtpVerifyRequest;
import com.lifemate.backend.dto.SecurityInfoResponse;
import com.lifemate.backend.service.SecurityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/security")
public class SecurityController {

    private final SecurityService service;

    public SecurityController(SecurityService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<SecurityInfoResponse> getInfo(Authentication auth) {
        return ResponseEntity.ok(service.getInfo(auth.getName()));
    }

    // Email verification
    @PostMapping("/send-email-otp")
    public ResponseEntity<Void> sendEmailOtp(Authentication auth) {
        service.sendEmailVerificationOtp(auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<SecurityInfoResponse> verifyEmail(Authentication auth, @Valid @RequestBody OtpVerifyRequest req) {
        service.verifyEmail(auth.getName(), req.getOtp());
        return ResponseEntity.ok(service.getInfo(auth.getName()));
    }

    // Phone verification
    @PostMapping("/send-phone-otp")
    public ResponseEntity<Void> sendPhoneOtp(Authentication auth, @Valid @RequestBody AddPhoneRequest req) {
        service.sendPhoneVerificationOtp(auth.getName(), req.getPhoneNumber());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<SecurityInfoResponse> verifyPhone(Authentication auth, @Valid @RequestBody OtpVerifyRequest req) {
        service.verifyPhone(auth.getName(), req.getOtp());
        return ResponseEntity.ok(service.getInfo(auth.getName()));
    }
}
