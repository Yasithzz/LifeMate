package com.lifemate.backend.repository;

import com.lifemate.backend.model.WorkoutLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface WorkoutLogRepository extends MongoRepository<WorkoutLog, String> {
    List<WorkoutLog> findByUserEmailOrderByRecordedAtDesc(String userEmail);
    List<WorkoutLog> findByUserEmailAndRecordedAtBetween(String userEmail, Instant from, Instant to);
}
