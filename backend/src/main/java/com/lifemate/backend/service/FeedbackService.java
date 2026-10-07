package com.lifemate.backend.service;

import com.lifemate.backend.dto.FeedbackRequest;
import com.lifemate.backend.dto.FeedbackResponse;
import com.lifemate.backend.exception.ApiException;
import com.lifemate.backend.model.Feedback;
import com.lifemate.backend.model.User;
import com.lifemate.backend.repository.FeedbackRepository;
import com.lifemate.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    public FeedbackResponse submitFeedback(String email, FeedbackRequest req) {
        if (req.message() == null || req.message().isBlank() || req.message().length() < 10)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Feedback message must be at least 10 characters");
        if (req.rating() < 1 || req.rating() > 5)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        // one feedback per user — update if already exists
        Feedback fb = feedbackRepository.findByUserEmail(email).orElse(new Feedback());
        fb.setUserEmail(email);
        fb.setUserName(displayName(user.getFullName()));
        fb.setMessage(req.message().trim());
        fb.setRating(req.rating());
        fb.setCreatedAt(Instant.now());

        return toResponse(feedbackRepository.save(fb));
    }

    public Optional<FeedbackResponse> getMyFeedback(String email) {
        return feedbackRepository.findByUserEmail(email).map(FeedbackService::toResponse);
    }

    public List<FeedbackResponse> getPublicFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(FeedbackService::toResponse)
                .toList();
    }

    public void deleteFeedback(String email) {
        feedbackRepository.deleteByUserEmail(email);
    }

    private static FeedbackResponse toResponse(Feedback fb) {
        return new FeedbackResponse(fb.getId(), fb.getUserName(), fb.getMessage(), fb.getRating(), fb.getCreatedAt());
    }

    // "Sarah Johnson" → "Sarah J."
    private static String displayName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "Anonymous";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) return parts[0];
        return parts[0] + " " + parts[parts.length - 1].charAt(0) + ".";
    }
}
