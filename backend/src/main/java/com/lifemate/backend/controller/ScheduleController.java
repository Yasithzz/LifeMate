package com.lifemate.backend.controller;

import com.lifemate.backend.model.User;
import com.lifemate.backend.model.WeeklySchedule;
import com.lifemate.backend.repository.UserRepository;
import com.lifemate.backend.service.WeeklyScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final WeeklyScheduleService weeklyScheduleService;
    private final UserRepository userRepository;

    public ScheduleController(WeeklyScheduleService weeklyScheduleService, UserRepository userRepository) {
        this.weeklyScheduleService = weeklyScheduleService;
        this.userRepository = userRepository;
    }

    /** Return the current week's schedule (generate a default if none exists yet) */
    @GetMapping
    public ResponseEntity<WeeklySchedule> getWeekly(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(new User());
        WeeklySchedule ws = weeklyScheduleService.getLatestOrGenerate(auth.getName(), 2, "Normal", user);
        return ResponseEntity.ok(ws);
    }

    /** Force regenerate weekly schedule using the latest stress analysis */
    @PostMapping("/generate")
    public ResponseEntity<WeeklySchedule> generate(Authentication auth,
                                                     @RequestBody(required = false) Map<String,String> body) {
        User user = userRepository.findByEmail(auth.getName()).orElse(new User());
        String stressLevel = body != null ? body.getOrDefault("stressLevel","Normal") : "Normal";
        int stressIndex    = stressLabelToIndex(stressLevel);
        return ResponseEntity.ok(weeklyScheduleService.generateForCurrentWeek(
                auth.getName(), stressIndex, stressLevel, user));
    }

    /** Mark/unmark a specific slot as completed/skipped */
    @PatchMapping("/items/{itemId}")
    public ResponseEntity<WeeklySchedule> patchSlot(Authentication auth,
                                                      @PathVariable String itemId,
                                                      @RequestBody Map<String,String> body) {
        String day    = body.get("day");
        String status = body.getOrDefault("status","completed");
        return ResponseEntity.ok(weeklyScheduleService.updateSlotStatus(auth.getName(), day, itemId, status));
    }

    /** Add a custom slot to a specific day */
    @PostMapping("/items")
    public ResponseEntity<WeeklySchedule> addSlot(Authentication auth,
                                                    @RequestBody Map<String,String> body) {
        String day = body.get("day");
        WeeklySchedule.DaySlot slot = new WeeklySchedule.DaySlot();
        slot.setStartTime(body.get("startTime"));
        slot.setEndTime(body.get("endTime"));
        slot.setActivityType(body.getOrDefault("activityType","Other"));
        slot.setTitle(body.getOrDefault("title","Custom Activity"));
        slot.setStatus("pending");
        return ResponseEntity.ok(weeklyScheduleService.addCustomSlot(auth.getName(), day, slot));
    }

    /** Remove a slot */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<WeeklySchedule> deleteSlot(Authentication auth,
                                                       @PathVariable String itemId,
                                                       @RequestParam String day) {
        return ResponseEntity.ok(weeklyScheduleService.removeSlot(auth.getName(), day, itemId));
    }

    private int stressLabelToIndex(String label) {
        return switch (label) {
            case "Very Low" -> 0;
            case "Low"      -> 1;
            case "High"     -> 3;
            case "Very High"-> 4;
            default         -> 2; // Normal
        };
    }
}
