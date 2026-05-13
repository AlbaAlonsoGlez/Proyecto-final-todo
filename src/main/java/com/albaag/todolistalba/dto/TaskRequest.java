package com.albaag.todolistalba.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    @NotBlank(message = "El título no puede estar vacío")
    @Size(max = 100, message = "Título demasiado largo. Máximo 100 caracteres.")
    private String title;

    private String description;

    @Future(message = "La fecha límite debe ser en el futuro")
    private LocalDateTime deadline;

    @NotNull(message = "La tarea debe pertenecer a una categoría")
    private Long categoryId;
}
