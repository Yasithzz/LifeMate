package com.lifemate.backend.service;

import com.lifemate.backend.dto.TaskRequest;
import com.lifemate.backend.dto.TaskResponse;
import com.lifemate.backend.exception.ApiException;
import com.lifemate.backend.model.Task;
import com.lifemate.backend.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskResponse create(String userEmail, TaskRequest req) {
        validateDeadline(req.getDeadline(), req.getDeadlineTime());
        Task task = new Task();
        task.setUserEmail(userEmail);
        applyRequest(task, req);
        return toResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getAll(String userEmail) {
        return taskRepository.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream().map(this::toResponse).toList();
    }

    public TaskResponse update(String userEmail, String id, TaskRequest req) {
        Task task = find(userEmail, id);
        boolean deadlineChanged = !java.util.Objects.equals(task.getDeadline(), req.getDeadline())
                || !java.util.Objects.equals(task.getDeadlineTime(), req.getDeadlineTime());
        if (deadlineChanged) {
            validateDeadline(req.getDeadline(), req.getDeadlineTime());
        }
        applyRequest(task, req);
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse complete(String userEmail, String id) {
        Task task = find(userEmail, id);
        task.setStatus("Completed");
        task.setCompletedAt(Instant.now());
        return toResponse(taskRepository.save(task));
    }

    public void delete(String userEmail, String id) {
        Task task = find(userEmail, id);
        taskRepository.delete(task);
    }

    private Task find(String userEmail, String id) {
        return taskRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    private void applyRequest(Task task, TaskRequest req) {
        task.setTitle(req.getTitle());
        if (req.getCategory() != null) task.setCategory(req.getCategory());
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        task.setDeadline(req.getDeadline());
        task.setDeadlineTime(req.getDeadlineTime());
        task.setDurationMinutes(req.getDurationMinutes());
        if ("Completed".equals(req.getStatus()) && task.getCompletedAt() == null) {
            task.setCompletedAt(Instant.now());
        }
    }

    private void validateDeadline(String deadline, String deadlineTime) {
        if (deadline == null || deadline.isBlank()) return;
        LocalDate date;
        try {
            date = LocalDate.parse(deadline);
        } catch (DateTimeParseException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid deadline date");
        }
        LocalDate today = LocalDate.now();
        if (date.isBefore(today)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Deadline cannot be in the past");
        }
        if (date.isEqual(today) && deadlineTime != null && !deadlineTime.isBlank()) {
            try {
                if (LocalTime.parse(deadlineTime).isBefore(LocalTime.now())) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Deadline time cannot be in the past");
                }
            } catch (DateTimeParseException ignored) { /* no time part supplied in an unexpected format — skip */ }
        }
    }

    private TaskResponse toResponse(Task t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.getCategory(), t.getPriority(),
                t.getStatus(), t.getDeadline(), t.getDeadlineTime(), t.getDurationMinutes(), t.getCreatedAt(), t.getCompletedAt());
    }
}
