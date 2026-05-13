package com.albaag.todolistalba.repos;

import com.albaag.todolistalba.model.Category;
import com.albaag.todolistalba.model.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.scheduling.config.Task;

import java.util.List;

public interface TaskRepo extends JpaRepository<Task, Long> {
    List<Task> findByAuthor(User user, Sort sort);
    List<Task> findByCategory(Category category);
}
