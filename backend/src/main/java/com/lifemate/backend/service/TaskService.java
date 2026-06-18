package com.lifemate.backend.service;

import com.lifemate.backend.dto.TaskRequest;
import com.lifemate.backend.dto.TaskResponse;
import com.lifemate.backend.exception.ApiException;
import com.lifemate.backend.model.Task;
import com.lifemate.backend.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskResponse create(String userEmail, TaskRequest req) {
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
        task.setDurationMinutes(req.getDurationMinutes());
        if ("Completed".equals(req.getStatus()) && task.getCompletedAt() == null) {
            task.setCompletedAt(Instant.now());
        }
    }

    private TaskResponse toResponse(Task t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.getCategory(), t.getPriority(),
                t.getStatus(), t.getDeadline(), t.getDurationMinutes(), t.getCreatedAt(), t.getCompletedAt());
    }
}
