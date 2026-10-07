package com.lifemate.backend.controller;

import com.lifemate.backend.dto.FeedbackResponse;
import com.lifemate.backend.dto.UserResponse;
import com.lifemate.backend.model.Role;
import com.lifemate.backend.model.User;
import com.lifemate.backend.repository.FeedbackRepository;
import com.lifemate.backend.repository.UserRepository;
import com.lifemate.backend.service.FeedbackService;
import com.lifemate.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final FeedbackService feedbackService;
    private final FeedbackRepository feedbackRepository;

    public AdminController(UserRepository userRepository, UserService userService,
                           FeedbackService feedbackService, FeedbackRepository feedbackRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.feedbackService = feedbackService;
        this.feedbackRepository = feedbackRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(UserService::toUserResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id, Authentication auth) {
        userService.deleteAccountById(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/best-engaged")
    public ResponseEntity<List<UserResponse>> bestEngaged() {
        List<UserResponse> top = userRepository.findByRole(Role.USER).stream()
                .sorted(Comparator.comparingInt((User u) -> u.getLoginCount()).reversed())
                .limit(5)
                .map(UserService::toUserResponse)
                .toList();
        return ResponseEntity.ok(top);
    }

    @GetMapping("/users/inactive")
    public ResponseEntity<List<UserResponse>> inactiveUsers(
            @RequestParam(defaultValue = "30") int days) {
        Instant cutoff = Instant.now().minus(days, ChronoUnit.DAYS);
        List<UserResponse> inactive = userRepository.findByRole(Role.USER).stream()
                .filter(u -> u.getLastLoginAt() == null
                        ? u.getCreatedAt().isBefore(cutoff)
                        : u.getLastLoginAt().isBefore(cutoff))
                .map(UserService::toUserResponse)
                .toList();
        return ResponseEntity.ok(inactive);
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<List<FeedbackResponse>> listFeedbacks() {
        return ResponseEntity.ok(feedbackService.getPublicFeedbacks());
    }

    @DeleteMapping("/feedbacks/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable String id) {
        feedbackRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Instant now = Instant.now();
        Instant startOfDay = now.minus(1, ChronoUnit.DAYS);
        Instant startOfWeek = now.minus(7, ChronoUnit.DAYS);
        Instant inactiveCutoff = now.minus(30, ChronoUnit.DAYS);

        List<User> regularUsers = userRepository.findByRole(Role.USER);

        long totalUsers = regularUsers.size();
        long activeToday = regularUsers.stream()
                .filter(u -> u.getLastLoginAt() != null && u.getLastLoginAt().isAfter(startOfDay))
                .count();
        long newThisWeek = regularUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfWeek))
                .count();
        long inactiveCount = regularUsers.stream()
                .filter(u -> u.getLastLoginAt() == null
                        ? u.getCreatedAt().isBefore(inactiveCutoff)
                        : u.getLastLoginAt().isBefore(inactiveCutoff))
                .count();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "activeToday", activeToday,
                "newThisWeek", newThisWeek,
                "inactiveCount", inactiveCount
        ));
    }
}
