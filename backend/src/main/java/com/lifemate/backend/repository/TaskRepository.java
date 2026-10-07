package com.lifemate.backend.repository;

import com.lifemate.backend.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<Task> findByUserEmailAndStatus(String userEmail, String status);
    Optional<Task> findByIdAndUserEmail(String id, String userEmail);
    void deleteByUserEmail(String userEmail);
}
