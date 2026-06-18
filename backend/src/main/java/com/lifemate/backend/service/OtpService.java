package com.lifemate.backend.service;

import com.lifemate.backend.exception.ApiException;
import com.lifemate.backend.model.OtpEntry;
import com.lifemate.backend.repository.OtpRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class OtpService {

    private static final int OTP_EXPIRY_MINUTES = 10;
    private final SecureRandom random = new SecureRandom();
    private final OtpRepository otpRepository;

    public OtpService(OtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    public String generateAndStore(String identifier, OtpEntry.OtpType type) {
        // Invalidate any existing OTP for this identifier+type
        otpRepository.deleteByIdentifierAndType(identifier, type);

        String code = String.format("%06d", random.nextInt(1_000_000));

        OtpEntry entry = new OtpEntry();
        entry.setIdentifier(identifier);
        entry.setCode(code);
        entry.setType(type);
        entry.setExpiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));

        otpRepository.save(entry);
        return code;
    }

    public void verify(String identifier, OtpEntry.OtpType type, String code) {
        OtpEntry entry = otpRepository
                .findTopByIdentifierAndTypeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        identifier, type, Instant.now())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "OTP expired or not found. Please request a new one."));

        if (!entry.getCode().equals(code.trim())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Incorrect OTP. Please try again.");
        }

        entry.setUsed(true);
        otpRepository.save(entry);
    }
}
