package com.lifemate.backend.repository;

import com.lifemate.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<Notification> findByUserEmailAndIsRead(String userEmail, boolean isRead);
    long countByUserEmailAndIsRead(String userEmail, boolean isRead);
    void deleteByUserEmail(String userEmail);
}
