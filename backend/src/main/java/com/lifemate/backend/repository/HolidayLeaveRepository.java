package com.lifemate.backend.repository;

import com.lifemate.backend.model.HolidayLeave;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface HolidayLeaveRepository extends MongoRepository<HolidayLeave, String> {
    List<HolidayLeave> findByUserEmailOrderByDateAsc(String userEmail);
    Optional<HolidayLeave> findByUserEmailAndDate(String userEmail, String date);
    void deleteByUserEmailAndDate(String userEmail, String date);
}
