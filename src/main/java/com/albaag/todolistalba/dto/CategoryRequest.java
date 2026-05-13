package com.albaag.todolistalba.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {
    @NotBlank(message = "La categoría debe llevar un nombre")
    @Size(min = 1, max = 50, message = "La categoría debe tener entre 1 y 100 caracteres")
    private String Title;
}
