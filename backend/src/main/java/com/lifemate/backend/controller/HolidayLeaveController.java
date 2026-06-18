package com.lifemate.backend.controller;

import com.lifemate.backend.model.HolidayLeave;
import com.lifemate.backend.repository.HolidayLeaveRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/me/holidays")
public class HolidayLeaveController {

    private final HolidayLeaveRepository repo;

    public HolidayLeaveController(HolidayLeaveRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<List<HolidayLeave>> getAll(Authentication auth) {
        return ResponseEntity.ok(repo.findByUserEmailOrderByDateAsc(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<HolidayLeave> add(Authentication auth, @RequestBody Map<String,String> body) {
        String date = body.get("date");
        String type = body.getOrDefault("type", "LEAVE");
        String note = body.getOrDefault("note", "");
        // Upsert — one entry per date
        repo.findByUserEmailAndDate(auth.getName(), date).ifPresent(repo::delete);
        HolidayLeave hl = new HolidayLeave();
        hl.setUserEmail(auth.getName());
        hl.setDate(date);
        hl.setType(type);
        hl.setNote(note);
        return ResponseEntity.ok(repo.save(hl));
    }

    @DeleteMapping("/{date}")
    public ResponseEntity<Void> remove(Authentication auth, @PathVariable String date) {
        repo.deleteByUserEmailAndDate(auth.getName(), date);
        return ResponseEntity.noContent().build();
    }
}
