package com.lifemate.backend.repository;

import com.lifemate.backend.model.LifestyleEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface LifestyleRepository extends MongoRepository<LifestyleEntry, String> {
    List<LifestyleEntry> findByUserEmailOrderBySubmittedAtDesc(String userEmail);
    Optional<LifestyleEntry> findTopByUserEmailOrderBySubmittedAtDesc(String userEmail);
    Optional<LifestyleEntry> findTopByUserEmailAndSubmittedAtBetweenOrderBySubmittedAtDesc(String userEmail, Instant from, Instant to);
}
