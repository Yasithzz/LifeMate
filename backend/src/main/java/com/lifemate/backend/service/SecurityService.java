package com.lifemate.backend.service;

import com.lifemate.backend.dto.SecurityInfoResponse;
import com.lifemate.backend.exception.ApiException;
import com.lifemate.backend.model.OtpEntry;
import com.lifemate.backend.model.User;
import com.lifemate.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SecurityService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PasswordEncoder passwordEncoder;

    public SecurityService(UserRepository userRepository, OtpService otpService,
                            EmailService emailService, SmsService smsService,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.emailService = emailService;
        this.smsService = smsService;
        this.passwordEncoder = passwordEncoder;
    }

    public SecurityInfoResponse getInfo(String email) {
        User user = findUser(email);
        return new SecurityInfoResponse(user.isEmailVerified(), user.isPhoneVerified(), maskPhone(user.getPhoneNumber()));
    }

    // ---------- Email verification ----------

    public void sendEmailVerificationOtp(String email) {
        User user = findUser(email);
        String otp = otpService.generateAndStore(email, OtpEntry.OtpType.EMAIL_VERIFICATION);
        emailService.sendOtp(user.getEmail(), otp, "Email Verification");
    }

    public void verifyEmail(String email, String otp) {
        otpService.verify(email, OtpEntry.OtpType.EMAIL_VERIFICATION, otp);
        User user = findUser(email);
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    // ---------- Phone verification ----------

    public void sendPhoneVerificationOtp(String email, String phoneNumber) {
        findUser(email);
        String otp = otpService.generateAndStore(phoneNumber, OtpEntry.OtpType.PHONE_VERIFICATION);
        smsService.sendOtp(phoneNumber, otp, "Phone Verification");
        // Store phone number on user (unverified until OTP confirmed)
        User user = findUser(email);
        user.setPhoneNumber(phoneNumber);
        user.setPhoneVerified(false);
        userRepository.save(user);
    }

    public void verifyPhone(String email, String otp) {
        User user = findUser(email);
        if (user.getPhoneNumber() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No phone number added. Please add a phone number first.");
        }
        otpService.verify(user.getPhoneNumber(), OtpEntry.OtpType.PHONE_VERIFICATION, otp);
        user.setPhoneVerified(true);
        userRepository.save(user);
    }

    // ---------- Forgot password ----------

    public void initiateForgotPassword(String email, String method) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No account found with this email."));

        if ("phone".equals(method)) {
            if (user.getPhoneNumber() == null || !user.isPhoneVerified()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "No verified phone number on this account.");
            }
            String otp = otpService.generateAndStore(email, OtpEntry.OtpType.FORGOT_PASSWORD);
            smsService.sendOtp(user.getPhoneNumber(), otp, "Password Reset");
        } else {
            String otp = otpService.generateAndStore(email, OtpEntry.OtpType.FORGOT_PASSWORD);
            emailService.sendOtp(user.getEmail(), otp, "Password Reset");
        }
    }

    public void resetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = email.trim().toLowerCase();
        otpService.verify(normalizedEmail, OtpEntry.OtpType.FORGOT_PASSWORD, otp);
        User user = findUser(normalizedEmail);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ---------- Private helpers ----------

    private User findUser(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 5) return null;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }
}
