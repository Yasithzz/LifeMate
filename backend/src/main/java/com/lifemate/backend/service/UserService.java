package com.lifemate.backend.service;

import com.lifemate.backend.dto.ChangePasswordRequest;
import com.lifemate.backend.dto.ProfileRequest;
import com.lifemate.backend.dto.ProfileResponse;
import com.lifemate.backend.dto.UserResponse;
import com.lifemate.backend.exception.ApiException;
import com.lifemate.backend.model.User;
import com.lifemate.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse getCurrentUser(String email) {
        User user = findByEmail(email);
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    public ProfileResponse getProfile(String email) {
        User u = findByEmail(email);
        return new ProfileResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(),
                u.getSleepSchedule(), u.getWakeTime(), u.getWorkHours(),
                u.getMealPreference(), u.getWorkoutPreference(), u.getFreeTimePreference(), u.getReminderPreference());
    }

    public ProfileResponse updateProfile(String email, ProfileRequest req) {
        User u = findByEmail(email);
        if (req.getSleepSchedule() != null) u.setSleepSchedule(req.getSleepSchedule());
        if (req.getWakeTime() != null) u.setWakeTime(req.getWakeTime());
        if (req.getWorkHours() != null) u.setWorkHours(req.getWorkHours());
        if (req.getMealPreference() != null) u.setMealPreference(req.getMealPreference());
        if (req.getWorkoutPreference() != null) u.setWorkoutPreference(req.getWorkoutPreference());
        if (req.getFreeTimePreference() != null) u.setFreeTimePreference(req.getFreeTimePreference());
        if (req.getReminderPreference() != null) u.setReminderPreference(req.getReminderPreference());
        userRepository.save(u);
        return getProfile(email);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
