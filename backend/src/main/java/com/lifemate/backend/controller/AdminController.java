package com.lifemate.backend.controller;

import com.lifemate.backend.dto.UserResponse;
import com.lifemate.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name()))
                .toList();
        return ResponseEntity.ok(users);
    }
}
