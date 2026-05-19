package com.albaag.todolistalba.repos;

import com.albaag.todolistalba.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepo extends JpaRepository<Category, Long> {
    Optional<Category> findByTitle(String title);
}