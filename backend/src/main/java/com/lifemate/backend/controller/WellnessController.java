package com.lifemate.backend.controller;

import com.lifemate.backend.dto.WaterRequest;
import com.lifemate.backend.dto.WellnessResponse;
import com.lifemate.backend.dto.WorkoutRequest;
import com.lifemate.backend.service.WellnessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wellness")
public class WellnessController {

    private final WellnessService service;

    public WellnessController(WellnessService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<WellnessResponse> getSummary(Authentication auth) {
        return ResponseEntity.ok(service.getSummary(auth.getName()));
    }

    @PostMapping("/water")
    public ResponseEntity<Void> logWater(Authentication auth, @Valid @RequestBody WaterRequest req) {
        service.logWater(auth.getName(), req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/water/{id}")
    public ResponseEntity<Void> deleteWater(Authentication auth, @PathVariable String id) {
        service.deleteWater(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/workouts")
    public ResponseEntity<Void> logWorkout(Authentication auth, @Valid @RequestBody WorkoutRequest req) {
        service.logWorkout(auth.getName(), req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/workouts/{id}")
    public ResponseEntity<Void> deleteWorkout(Authentication auth, @PathVariable String id) {
        service.deleteWorkout(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
