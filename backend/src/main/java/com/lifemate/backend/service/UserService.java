package com.lifemate.backend.service;

import com.lifemate.backend.dto.ChangePasswordRequest;
import com.lifemate.backend.dto.ProfileRequest;
import com.lifemate.backend.dto.ProfileResponse;
import com.lifemate.backend.dto.UserResponse;
import com.lifemate.backend.exception.ApiException;
import com.lifemate.backend.model.Role;
import com.lifemate.backend.model.User;
import com.lifemate.backend.repository.*;
import com.lifemate.backend.repository.FeedbackRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final LifestyleRepository lifestyleRepository;
    private final WaterIntakeRepository waterIntakeRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final WeeklyScheduleRepository weeklyScheduleRepository;
    private final HolidayLeaveRepository holidayLeaveRepository;
    private final ScheduleRepository scheduleRepository;
    private final FeedbackRepository feedbackRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       TaskRepository taskRepository, NotificationRepository notificationRepository,
                       LifestyleRepository lifestyleRepository, WaterIntakeRepository waterIntakeRepository,
                       WorkoutLogRepository workoutLogRepository, WeeklyScheduleRepository weeklyScheduleRepository,
                       HolidayLeaveRepository holidayLeaveRepository, ScheduleRepository scheduleRepository,
                       FeedbackRepository feedbackRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.taskRepository = taskRepository;
        this.notificationRepository = notificationRepository;
        this.lifestyleRepository = lifestyleRepository;
        this.waterIntakeRepository = waterIntakeRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.weeklyScheduleRepository = weeklyScheduleRepository;
        this.holidayLeaveRepository = holidayLeaveRepository;
        this.scheduleRepository = scheduleRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public UserResponse getCurrentUser(String email) {
        User user = findByEmail(email);
        return toUserResponse(user);
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(),
                user.getCreatedAt(), user.getLastLoginAt(), user.getLoginCount());
    }

    public ProfileResponse getProfile(String email) {
        User u = findByEmail(email);
        return toProfileResponse(u);
    }

    private static ProfileResponse toProfileResponse(User u) {
        return new ProfileResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(),
                u.getSleepSchedule(), u.getWakeTime(), u.getWorkHours(),
                u.getMealPreference(), u.getWorkoutPreference(), u.getFreeTimePreference(),
                u.getReminderPreference(), u.getWorkingDays(), u.getAvatarBase64());
    }

    public ProfileResponse updateProfile(String email, ProfileRequest req) {
        User u = findByEmail(email);
        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            String name = req.getFullName().trim();
            if (name.length() > 60) throw new ApiException(HttpStatus.BAD_REQUEST, "Name must be 60 characters or fewer");
            u.setFullName(name);
        }
        if (req.getSleepSchedule() != null) u.setSleepSchedule(req.getSleepSchedule());
        if (req.getWakeTime() != null) u.setWakeTime(req.getWakeTime());
        if (req.getWorkHours() != null) u.setWorkHours(req.getWorkHours());
        if (req.getMealPreference() != null) u.setMealPreference(req.getMealPreference());
        if (req.getWorkoutPreference() != null) u.setWorkoutPreference(req.getWorkoutPreference());
        if (req.getFreeTimePreference() != null) u.setFreeTimePreference(req.getFreeTimePreference());
        if (req.getReminderPreference() != null) u.setReminderPreference(req.getReminderPreference());
        if (req.getWorkingDays() != null && !req.getWorkingDays().isEmpty())
            u.setWorkingDays(req.getWorkingDays());
        if (req.getAvatarBase64() != null) {
            if (req.getAvatarBase64().length() > 700_000) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Avatar image is too large. Please use an image under 500 KB.");
            }
            u.setAvatarBase64(req.getAvatarBase64().isEmpty() ? null : req.getAvatarBase64());
        }
        userRepository.save(u);
        return toProfileResponse(u);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void deleteAccount(String email) {
        User user = findByEmail(email);
        if (user.getRole() == Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin accounts cannot be deleted");
        }
        cascadeDelete(email);
        userRepository.delete(user);
    }

    public void deleteAccountById(String id, String requestingEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin accounts cannot be deleted");
        }
        cascadeDelete(user.getEmail());
        userRepository.delete(user);
    }

    private void cascadeDelete(String email) {
        taskRepository.deleteByUserEmail(email);
        notificationRepository.deleteByUserEmail(email);
        lifestyleRepository.deleteByUserEmail(email);
        waterIntakeRepository.deleteByUserEmail(email);
        workoutLogRepository.deleteByUserEmail(email);
        weeklyScheduleRepository.deleteByUserEmail(email);
        holidayLeaveRepository.deleteByUserEmail(email);
        scheduleRepository.deleteByUserEmail(email);
        feedbackRepository.deleteByUserEmail(email);
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
