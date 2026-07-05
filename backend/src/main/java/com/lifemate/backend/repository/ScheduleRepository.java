package com.lifemate.backend.repository;

import com.lifemate.backend.model.Schedule;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ScheduleRepository extends MongoRepository<Schedule, String> {
    Optional<Schedule> findTopByUserEmailOrderByCreatedAtDesc(String userEmail);
    Optional<Schedule> findByUserEmailAndScheduleDate(String userEmail, String scheduleDate);
    void deleteByUserEmail(String userEmail);
}
