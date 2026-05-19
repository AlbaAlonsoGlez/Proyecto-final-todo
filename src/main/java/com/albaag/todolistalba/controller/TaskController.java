package com.albaag.todolistalba.controller;

import com.albaag.todolistalba.dto.DashboardResponse;
import com.albaag.todolistalba.dto.TaskRequest;
import com.albaag.todolistalba.dto.TaskResponse;
import com.albaag.todolistalba.model.Priority;
import com.albaag.todolistalba.model.TaskStatus;
import com.albaag.todolistalba.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Gestión de tareas del usuario autenticado")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Listar todas las tareas", description = "Devuelve todas las tareas del usuario autenticado")
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(taskService.findAll(auth.getName()));
    }

    @Operation(summary = "Obtener tarea por ID")
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getById(
            @Parameter(description = "ID de la tarea") @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(taskService.findById(id, auth.getName()));
    }

    @Operation(summary = "Crear nueva tarea")
    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @Valid @RequestBody TaskRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.create(request, auth.getName()));
    }

    @Operation(summary = "Actualizar tarea")
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(
            @Parameter(description = "ID de la tarea") @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            Authentication auth) {
        return ResponseEntity.ok(taskService.update(id, request, auth.getName()));
    }

    @Operation(summary = "Eliminar tarea")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID de la tarea") @PathVariable Long id,
            Authentication auth) {
        taskService.delete(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskResponse>> getByStatus(
            @Parameter(description = "Estado: PENDIENTE, EN_PROGRESO, COMPLETADA") @PathVariable TaskStatus status,
            Authentication auth) {
        return ResponseEntity.ok(taskService.findByStatus(auth.getName(), status));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TaskResponse>> getByPriority(
            @Parameter(description = "Prioridad: BAJA, MEDIA, ALTA, URGENTE") @PathVariable Priority priority,
            Authentication auth) {
        return ResponseEntity.ok(taskService.findByPriority(auth.getName(), priority));
    }

    @GetMapping("/important")
    public ResponseEntity<List<TaskResponse>> getImportant(Authentication auth) {
        return ResponseEntity.ok(taskService.findImportant(auth.getName()));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<TaskResponse>> getOverdue(Authentication auth) {
        return ResponseEntity.ok(taskService.findOverdue(auth.getName()));
    }

    @GetMapping("/tag/{tagId}")
    public ResponseEntity<List<TaskResponse>> getByTag(
            @Parameter(description = "ID del tag") @PathVariable Long tagId,
            Authentication auth) {
        return ResponseEntity.ok(taskService.findByTag(auth.getName(), tagId));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TaskResponse>> getByCategory(
            @Parameter(description = "ID de la categoría") @PathVariable Long categoryId,
            Authentication auth) {
        return ResponseEntity.ok(taskService.findByCategory(auth.getName(), categoryId));
    }

    @PostMapping("/{taskId}/tags/{tagId}")
    public ResponseEntity<TaskResponse> assignTag(
            @PathVariable Long taskId,
            @PathVariable Long tagId,
            Authentication auth) {
        return ResponseEntity.ok(taskService.assignTag(taskId, tagId, auth.getName()));
    }

    @DeleteMapping("/{taskId}/tags/{tagId}")
    public ResponseEntity<Void> removeTag(
            @PathVariable Long taskId,
            @PathVariable Long tagId,
            Authentication auth) {
        taskService.removeTag(taskId, tagId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication auth) {
        return ResponseEntity.ok(taskService.getDashboard(auth.getName()));
    }
}
