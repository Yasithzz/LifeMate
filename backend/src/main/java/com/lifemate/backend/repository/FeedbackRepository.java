package com.lifemate.backend.repository;

import com.lifemate.backend.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    Optional<Feedback> findByUserEmail(String userEmail);
    void deleteByUserEmail(String userEmail);
    List<Feedback> findAllByOrderByCreatedAtDesc();
}
