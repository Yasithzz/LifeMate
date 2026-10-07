package com.lifemate.backend.service;

import com.lifemate.backend.dto.NotificationResponse;
import com.lifemate.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public List<NotificationResponse> getAll(String userEmail) {
        return repo.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream().map(n -> new NotificationResponse(n.getId(), n.getMessage(), n.getType(), n.isRead(), n.getCreatedAt()))
                .toList();
    }

    public void markRead(String userEmail, String id) {
        repo.findById(id).ifPresent(n -> {
            if (n.getUserEmail().equals(userEmail)) { n.setRead(true); repo.save(n); }
        });
    }

    public void markAllRead(String userEmail) {
        repo.findByUserEmailAndIsRead(userEmail, false).forEach(n -> { n.setRead(true); repo.save(n); });
    }

    public void delete(String userEmail, String id) {
        repo.findById(id).ifPresent(n -> { if (n.getUserEmail().equals(userEmail)) repo.delete(n); });
    }

    public long unreadCount(String userEmail) {
        return repo.countByUserEmailAndIsRead(userEmail, false);
    }
}
