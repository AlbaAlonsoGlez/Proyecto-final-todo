package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.Priority;
import com.albaag.todolistalba.model.Task;
import com.albaag.todolistalba.model.TaskStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de salida que representa una tarea completa.
 * Incluye sus categorías, etiquetas y autor asociados.
 *
 * @param id          Identificador único de la tarea
 * @param title       Título de la tarea
 * @param description Descripción detallada
 * @param completed   Indica si está completada
 * @param important   Indica si es importante
 * @param priority    Nivel de prioridad
 * @param status      Estado actual de la tarea
 * @param comments    Comentarios adicionales
 * @param createdAt   Fecha de creación
 * @param updatedAt   Fecha de última actualización
 * @param deadline    Fecha límite
 * @param categories  Lista de categorías asociadas
 * @param tags        Lista de etiquetas asociadas
 * @param author      Usuario autor de la tarea
 */
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
    /** Método factoría que convierte una entidad Task en su DTO de respuesta. */
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
