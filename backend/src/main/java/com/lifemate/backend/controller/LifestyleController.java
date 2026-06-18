package com.lifemate.backend.controller;

import com.lifemate.backend.dto.LifestyleRequest;
import com.lifemate.backend.dto.LifestyleResponse;
import com.lifemate.backend.service.LifestyleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lifestyle")
public class LifestyleController {

    private final LifestyleService service;

    public LifestyleController(LifestyleService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<LifestyleResponse> submit(Authentication auth, @Valid @RequestBody LifestyleRequest req) {
        return ResponseEntity.ok(service.submit(auth.getName(), req));
    }

    @GetMapping
    public ResponseEntity<List<LifestyleResponse>> history(Authentication auth) {
        return ResponseEntity.ok(service.getHistory(auth.getName()));
    }

    @GetMapping("/today")
    public ResponseEntity<LifestyleResponse> today(Authentication auth) {
        return service.getToday(auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/latest")
    public ResponseEntity<LifestyleResponse> latest(Authentication auth) {
        return service.getLatest(auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
