package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.Category;

/**
 * DTO de salida que representa una categoría.
 *
 * @param id          Identificador único de la categoría
 * @param title       Nombre de la categoría
 * @param color       Color en formato hexadecimal
 * @param description Descripción de la categoría
 */
public record CategoryResponse(Long id, String title, String color, String description) {

    /** Método factoría que convierte una entidad Category en su DTO de respuesta. */
    public static CategoryResponse of(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getTitle(),
                category.getColor(),
                category.getDescription()
        );
    }
}