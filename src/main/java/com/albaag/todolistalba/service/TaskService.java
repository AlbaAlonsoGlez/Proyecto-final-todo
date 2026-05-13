package com.albaag.todolistalba.service;

import com.albaag.todolistalba.dto.TaskRequest;
import com.albaag.todolistalba.dto.TaskResponse;
import com.albaag.todolistalba.repos.TaskRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.config.Task;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepo taskRepository;

    public List<TaskResponse> findAll() {
        return taskRepository.findAll()
                .stream()
                .map(TaskResponse::of)
                .toList();
    }

    public TaskResponse findById(Long id) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La tarea no ha sido encontrada :("));

        return TaskResponse.of(task);
    }

    public TaskResponse create(TaskRequest request) {

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .comments(request.getComments())
                .completed(request.isCompleted())
                .deadline(request.getDeadline())
                .important(request.isImportant())
                .priority(request.getPriority())
                .status(request.getStatus())
                .createdAt(LocalDateTime.now())
                .updatedAt(null)
                .build();

        Task saved = taskRepository.save(task);

        return TaskResponse.of(saved);
    }

    public TaskResponse update(Long id, TaskRequest request) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setComments(request.getComments());
        task.setCompleted(request.isCompleted());
        task.setDeadline(request.getDeadline());
        task.setImportant(request.isImportant());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setUpdatedAt(LocalDateTime.now());

        task.setTags(request.getTags());
        task.setCategories(request.getCategories());

        return TaskResponse.of(taskRepository.save(task));
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
    }
