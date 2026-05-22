package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.Tag;

/**
 * DTO de salida que representa una etiqueta.
 *
 * @param id          Identificador único de la etiqueta
 * @param name        Nombre de la etiqueta
 * @param color       Color en formato hexadecimal
 * @param description Descripción de la etiqueta
 */
public record TagResponse(Long id, String name, String color, String description) {

    /** Método factoría que convierte una entidad Tag en su DTO de respuesta. */
    public static TagResponse of(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor(), tag.getDescription());
    }
}
