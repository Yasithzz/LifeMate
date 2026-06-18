package com.lifemate.backend.controller;

import com.lifemate.backend.dto.TaskRequest;
import com.lifemate.backend.dto.TaskResponse;
import com.lifemate.backend.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(Authentication auth, @Valid @RequestBody TaskRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(auth.getName(), req));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(service.getAll(auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(Authentication auth, @PathVariable String id, @Valid @RequestBody TaskRequest req) {
        return ResponseEntity.ok(service.update(auth.getName(), id, req));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> complete(Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(service.complete(auth.getName(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable String id) {
        service.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
