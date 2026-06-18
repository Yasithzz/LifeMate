package com.lifemate.backend.repository;

import com.lifemate.backend.model.WaterIntake;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface WaterIntakeRepository extends MongoRepository<WaterIntake, String> {
    List<WaterIntake> findByUserEmailAndRecordedAtBetweenOrderByRecordedAtDesc(String userEmail, Instant from, Instant to);
    List<WaterIntake> findByUserEmailOrderByRecordedAtDesc(String userEmail);
}
