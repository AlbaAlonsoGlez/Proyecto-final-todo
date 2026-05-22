package com.albaag.todolistalba.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de entrada para crear un nuevo usuario.
 * Incluye validación de email y campos de contraseña.
 */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class CreateUserRequest {

        /** Nombre de usuario. */
        private String username;

        /** Correo electrónico (obligatorio, debe tener formato válido). */
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El formato del email no es válido")
        private String email;

        /** Nombre completo del usuario. */
        private String fullname;

        /** Contraseña del usuario. */
        private String password;

        /** Confirmación de la contraseña (debe coincidir con password). */
        private String verifyPassword;

        /** Rol asignado al usuario (USER, ADMIN, GESTOR). */
        private String role;
}
