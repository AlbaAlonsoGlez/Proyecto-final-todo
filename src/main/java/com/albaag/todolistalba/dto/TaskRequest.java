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

/**
 * DTO de entrada para crear o actualizar una tarea.
 * Contiene los campos que el cliente envía en el cuerpo de la petición.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    /** Título de la tarea (obligatorio). */
    @NotBlank(message = "El título es obligatorio")
    private String title;

    /** Descripción detallada de la tarea. */
    private String description;

    /** Comentarios adicionales sobre la tarea. */
    private String comments;

    /** Indica si la tarea está completada. */
    private boolean completed;

    /** Indica si la tarea es importante. */
    private boolean important;

    /** Nivel de prioridad de la tarea (BAJA, MEDIA, ALTA, URGENTE). */
    private Priority priority;

    /** Estado actual de la tarea (PENDIENTE, EN_PROGRESO, COMPLETADA). */
    private TaskStatus status;

    /** Fecha límite para completar la tarea. */
    private LocalDateTime deadline;

    /** IDs de las categorías asociadas a la tarea. */
    private Set<Long> categoryIds;

    /** IDs de las etiquetas asociadas a la tarea. */
    private Set<Long> tagIds;
}
