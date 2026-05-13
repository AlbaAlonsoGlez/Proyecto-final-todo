package com.albaag.todolistalba.repos;

import com.albaag.todolistalba.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepo extends JpaRepository<Category, Long> {
}