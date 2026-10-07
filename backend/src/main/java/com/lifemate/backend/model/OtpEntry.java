package com.lifemate.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "otp_entries")
public class OtpEntry {

    public enum OtpType {
        EMAIL_VERIFICATION,
        PHONE_VERIFICATION,
        FORGOT_PASSWORD
    }

    @Id
    private String id;

    @Indexed
    private String identifier; // email or phone number

    private String code;
    private OtpType type;
    private boolean used = false;
    private Instant expiresAt;
    private Instant createdAt = Instant.now();
}
