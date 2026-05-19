package com.albaag.todolistalba.repos;

import com.albaag.todolistalba.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepo extends JpaRepository<Task, Long> {
    List<Task> findByAuthor(User author);
    List<Task> findByAuthorAndStatus(User author, TaskStatus status);
    List<Task> findByAuthorAndPriority(User author, Priority priority);
    List<Task> findByAuthorAndImportantTrue(User author);
    List<Task> findByAuthorAndDeadlineBefore(User author, LocalDateTime deadline);
    List<Task> findByAuthorAndTagsContaining(User author, Tag tag);
    List<Task> findByAuthorAndCategoriesContaining(User author, Category category);

    List<Task> findByStatus(TaskStatus status);
    List<Task> findByPriority(Priority priority);
    List<Task> findByImportantTrue();
    List<Task> findByDeadlineBefore(LocalDateTime deadline);
    List<Task> findByTagsContaining(Tag tag);
    List<Task> findByCategoriesContaining(Category category);
}
