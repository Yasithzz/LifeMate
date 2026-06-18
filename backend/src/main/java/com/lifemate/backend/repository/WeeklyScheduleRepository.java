package com.lifemate.backend.repository;

import com.lifemate.backend.model.WeeklySchedule;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WeeklyScheduleRepository extends MongoRepository<WeeklySchedule, String> {
    // Returns ALL docs for a user+week (may be multiple due to concurrent writes)
    List<WeeklySchedule> findByUserEmailAndWeekStartDate(String userEmail, String weekStartDate);
    // Bulk delete — removes ALL duplicates atomically
    void deleteAllByUserEmailAndWeekStartDate(String userEmail, String weekStartDate);
    Optional<WeeklySchedule> findTopByUserEmailOrderByGeneratedAtDesc(String userEmail);
}
