package com.lifemate.backend.controller;

import com.lifemate.backend.dto.NotificationResponse;
import com.lifemate.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(service.getAll(auth.getName()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication auth) {
        return ResponseEntity.ok(Map.of("count", service.unreadCount(auth.getName())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(Authentication auth, @PathVariable String id) {
        service.markRead(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        service.markAllRead(auth.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable String id) {
        service.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
