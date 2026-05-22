package com.albaag.todolistalba.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de entrada para crear o actualizar una etiqueta.
 * Incluye validaciones de formato y longitud.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagRequest {

    /** Nombre de la etiqueta (obligatorio, entre 1 y 50 caracteres). */
    @NotBlank(message = "El nombre del tag es obligatorio")
    @Size(min = 1, max = 50)
    private String name;

    /** Color en formato hexadecimal (ej: #3498DB). */
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "El color debe ser un código hexadecimal válido")
    private String color;

    /** Descripción de la etiqueta (máximo 255 caracteres). */
    @Size(max = 255)
    private String description;
}
