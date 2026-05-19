package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.Priority;
import com.albaag.todolistalba.model.Task;
import com.albaag.todolistalba.model.TaskStatus;

import java.time.LocalDateTime;
import java.util.List;

public record TaskResponse(
        Long id,
        String title,
        String description,
        boolean completed,
        boolean important,
        Priority priority,
        TaskStatus status,
        String comments,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deadline,
        List<CategoryResponse> categories,
        List<TagResponse> tags,
        UserResponse author
) {
    public static TaskResponse of(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.isCompleted(),
                task.isImportant(),
                task.getPriority(),
                task.getStatus(),
                task.getComments(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getDeadline(),
                task.getCategories().stream().map(CategoryResponse::of).toList(),
                task.getTags().stream().map(TagResponse::of).toList(),
                task.getAuthor() != null ? UserResponse.of(task.getAuthor()) : null);
    }
}
