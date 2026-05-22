package com.albaag.todolistalba.service;

import com.albaag.todolistalba.dto.DashboardResponse;
import com.albaag.todolistalba.dto.TaskRequest;
import com.albaag.todolistalba.dto.TaskResponse;
import com.albaag.todolistalba.model.*;
import com.albaag.todolistalba.repos.CategoryRepo;
import com.albaag.todolistalba.repos.TagRepo;
import com.albaag.todolistalba.repos.TaskRepo;
import com.albaag.todolistalba.repos.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepo taskRepo;
    private final UserRepo userRepo;
    private final CategoryRepo categoryRepo;
    private final TagRepo tagRepo;

    private User getUser(String username) {
        return userRepo.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private boolean isAdmin(User user) {
        return UserRole.ADMIN.equals(user.getRole());
    }

    private void checkAccess(Task task, User user) {
        if (isAdmin(user)) return;
        if (task.getAuthor() == null || !task.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permiso para acceder a esta tarea");
        }
    }

    public List<TaskResponse> findAll(String username) {
        User user = getUser(username);
        List<Task> tasks = isAdmin(user) ? taskRepo.findAll() : taskRepo.findByAuthor(user);
        return tasks.stream().map(TaskResponse::of).toList();
    }

    public TaskResponse findById(Long id, String username) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("La tarea no ha sido encontrada :("));
        checkAccess(task, getUser(username));
        return TaskResponse.of(task);
    }

    public TaskResponse create(TaskRequest request, String username) {
        User author = getUser(username);
        Set<Category> categories = request.getCategoryIds() != null
                ? new HashSet<>(categoryRepo.findAllById(request.getCategoryIds()))
                : new HashSet<>();
        Set<Tag> tags = request.getTagIds() != null
                ? new HashSet<>(tagRepo.findAllById(request.getTagIds()))
                : new HashSet<>();

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
                .author(author)
                .categories(categories)
                .tags(tags)
                .build();

        return TaskResponse.of(taskRepo.save(task));
    }

    public TaskResponse update(Long id, TaskRequest request, String username) {
        User user = getUser(username);
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("La tarea no ha sido encontrada :("));
        checkAccess(task, user);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setComments(request.getComments());
        task.setCompleted(request.isCompleted());
        task.setDeadline(request.getDeadline());
        task.setImportant(request.isImportant());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setUpdatedAt(LocalDateTime.now());

        if (request.getCategoryIds() != null) {
            task.setCategories(new HashSet<>(categoryRepo.findAllById(request.getCategoryIds())));
        }
        if (request.getTagIds() != null) {
            task.setTags(new HashSet<>(tagRepo.findAllById(request.getTagIds())));
        }

        return TaskResponse.of(taskRepo.save(task));
    }

    public void delete(Long id, String username) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("La tarea no ha sido encontrada :("));
        checkAccess(task, getUser(username));
        taskRepo.delete(task);
    }

    public List<TaskResponse> findByStatus(String username, TaskStatus status) {
        User user = getUser(username);
        List<Task> tasks = isAdmin(user)
                ? taskRepo.findByStatus(status)
                : taskRepo.findByAuthorAndStatus(user, status);
        return tasks.stream().map(TaskResponse::of).toList();
    }

    public List<TaskResponse> findByPriority(String username, Priority priority) {
        User user = getUser(username);
        List<Task> tasks = isAdmin(user)
                ? taskRepo.findByPriority(priority)
                : taskRepo.findByAuthorAndPriority(user, priority);
        return tasks.stream().map(TaskResponse::of).toList();
    }

    public List<TaskResponse> findImportant(String username) {
        User user = getUser(username);
        List<Task> tasks = isAdmin(user)
                ? taskRepo.findByImportantTrue()
                : taskRepo.findByAuthorAndImportantTrue(user);
        return tasks.stream().map(TaskResponse::of).toList();
    }

    public List<TaskResponse> findOverdue(String username) {
        User user = getUser(username);
        List<Task> tasks = isAdmin(user)
                ? taskRepo.findByDeadlineBefore(LocalDateTime.now())
                : taskRepo.findByAuthorAndDeadlineBefore(user, LocalDateTime.now());
        return tasks.stream().map(TaskResponse::of).toList();
    }

    public List<TaskResponse> findByTag(String username, Long tagId) {
        User user = getUser(username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new RuntimeException("El tag no ha sido encontrado"));
        List<Task> tasks = isAdmin(user)
                ? taskRepo.findByTagsContaining(tag)
                : taskRepo.findByAuthorAndTagsContaining(user, tag);
        return tasks.stream().map(TaskResponse::of).toList();
    }

    public List<TaskResponse> findByCategory(String username, Long categoryId) {
        User user = getUser(username);
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("La categoría no ha sido encontrada"));
        List<Task> tasks = isAdmin(user)
                ? taskRepo.findByCategoriesContaining(category)
                : taskRepo.findByAuthorAndCategoriesContaining(user, category);
        return tasks.stream().map(TaskResponse::of).toList();
    }

    public TaskResponse assignTag(Long taskId, Long tagId, String username) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("La tarea no ha sido encontrada :("));
        checkAccess(task, getUser(username));
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new RuntimeException("El tag no ha sido encontrado"));
        task.getTags().add(tag);
        return TaskResponse.of(taskRepo.save(task));
    }

    public void removeTag(Long taskId, Long tagId, String username) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("La tarea no ha sido encontrada :("));
        checkAccess(task, getUser(username));
        task.getTags().removeIf(t -> t.getId().equals(tagId));
        taskRepo.save(task);
    }

    public List<TaskResponse> searchTasks(String username, String title, Boolean completed, Long categoryId) {
        User user = getUser(username);
        boolean admin = isAdmin(user);
        List<Task> tasks;

        if (title != null && !title.isBlank()) {
            tasks = admin
                    ? taskRepo.findByTitleContainingIgnoreCase(title)
                    : taskRepo.findByAuthorAndTitleContainingIgnoreCase(user, title);
        } else if (completed != null) {
            tasks = admin
                    ? taskRepo.findByCompleted(completed)
                    : taskRepo.findByAuthorAndCompleted(user, completed);
        } else if (categoryId != null) {
            return findByCategory(username, categoryId);
        } else {
            return findAll(username);
        }
        return tasks.stream().map(TaskResponse::of).toList();
    }

    public DashboardResponse getDashboard(String username) {
        User user = getUser(username);
        List<Task> tasks = isAdmin(user) ? taskRepo.findAll() : taskRepo.findByAuthor(user);
        LocalDateTime now = LocalDateTime.now();
        long total = tasks.size();
        long pending = tasks.stream().filter(t -> TaskStatus.PENDIENTE.equals(t.getStatus())).count();
        long inProgress = tasks.stream().filter(t -> TaskStatus.EN_PROGRESO.equals(t.getStatus())).count();
        long completed = tasks.stream().filter(t -> TaskStatus.COMPLETADA.equals(t.getStatus())).count();
        long overdue = tasks.stream().filter(t ->
                t.getDeadline() != null &&
                t.getDeadline().isBefore(now) &&
                !TaskStatus.COMPLETADA.equals(t.getStatus())).count();
        long important = tasks.stream().filter(Task::isImportant).count();
        long highPriority = tasks.stream().filter(t ->
                Priority.ALTA.equals(t.getPriority()) || Priority.URGENTE.equals(t.getPriority())).count();
        long nearDeadline = tasks.stream().filter(t ->
                t.getDeadline() != null &&
                t.getDeadline().isAfter(now) &&
                t.getDeadline().isBefore(now.plusDays(7)) &&
                !TaskStatus.COMPLETADA.equals(t.getStatus())).count();
        long categoryCount = categoryRepo.count();
        long tagCount = tagRepo.count();
        return new DashboardResponse(total, pending, inProgress, completed, overdue, important, highPriority,
                nearDeadline, categoryCount, tagCount);
    }
}
