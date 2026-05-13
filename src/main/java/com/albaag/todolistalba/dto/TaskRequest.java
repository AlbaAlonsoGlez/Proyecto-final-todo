package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.Priority;
import com.albaag.todolistalba.model.TaskStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    @NotBlank(message = "El título es obligatorio")
    private String title;

    private String description;

    private String comments;

    private boolean completed;

    private boolean important;

    private Priority priority;

    private TaskStatus status;

    private LocalDateTime deadline;

    private Set<Long> categoryIds;

    private Set<Long> tagIds;
}
