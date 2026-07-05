package com.lifemate.backend.controller;

import com.lifemate.backend.dto.FeedbackRequest;
import com.lifemate.backend.dto.FeedbackResponse;
import com.lifemate.backend.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Public — shown on landing page
    @GetMapping("/public")
    public List<FeedbackResponse> getPublic() {
        return feedbackService.getPublicFeedbacks();
    }

    // Authenticated — submit or update own feedback
    @PostMapping
    public FeedbackResponse submit(@RequestBody FeedbackRequest req, Authentication auth) {
        return feedbackService.submitFeedback(auth.getName(), req);
    }

    // Authenticated — fetch own feedback
    @GetMapping("/mine")
    public ResponseEntity<?> getMine(Authentication auth) {
        return feedbackService.getMyFeedback(auth.getName())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(Map.of()));
    }

    // Authenticated — delete own feedback
    @DeleteMapping("/mine")
    public ResponseEntity<Void> deleteMine(Authentication auth) {
        feedbackService.deleteFeedback(auth.getName());
        return ResponseEntity.noContent().build();
    }
}
