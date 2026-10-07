package com.lifemate.backend.repository;

import com.lifemate.backend.model.OtpEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.Optional;

public interface OtpRepository extends MongoRepository<OtpEntry, String> {
    Optional<OtpEntry> findTopByIdentifierAndTypeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String identifier, OtpEntry.OtpType type, Instant now);
    void deleteByIdentifierAndType(String identifier, OtpEntry.OtpType type);
    void deleteByExpiresAtBefore(Instant now);
}
