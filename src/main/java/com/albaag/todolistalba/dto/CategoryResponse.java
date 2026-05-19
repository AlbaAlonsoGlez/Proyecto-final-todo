package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.Category;

public record CategoryResponse(Long id, String title, String color, String description) {
    public static CategoryResponse of(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getTitle(),
                category.getColor(),
                category.getDescription()
        );
    }
}