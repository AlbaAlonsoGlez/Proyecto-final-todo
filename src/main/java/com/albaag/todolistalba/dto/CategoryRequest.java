package com.albaag.todolistalba.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de entrada para crear o actualizar una categoría.
 * Incluye validaciones de formato y longitud.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    /** Nombre de la categoría (obligatorio, entre 1 y 50 caracteres). */
    @NotBlank(message = "La categoría debe llevar un nombre")
    @Size(min = 1, max = 50, message = "La categoría debe tener entre 1 y 50 caracteres")
    private String title;

    /** Color en formato hexadecimal (ej: #FF5733). */
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "El color debe ser un código hexadecimal válido")
    private String color;

    /** Descripción de la categoría (máximo 255 caracteres). */
    @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
    private String description;
}
