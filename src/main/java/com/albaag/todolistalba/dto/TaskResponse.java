package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.Task;

import java.time.LocalDateTime;
import java.util.List;

public record TaskResponse(
        Long id,
        String title,
        String description,
        boolean completed,
        LocalDateTime createdAt,
        LocalDateTime deadline,
        CategoryResponse category,
        List<TagResponse> tags,
        UserResponse author
) {
    public static TaskResponse of(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.isCompleted(),
                task.getCreatedAt(),
                task.getDeadline(),
                task.getCategory() != null ? CategoryResponse.of(task.getCategory()) : null,
                task.getTags().stream()
                        .map(TagResponse::of)
                        .toList(),
                UserResponse.of(task.getAuthor()));
    }
}
