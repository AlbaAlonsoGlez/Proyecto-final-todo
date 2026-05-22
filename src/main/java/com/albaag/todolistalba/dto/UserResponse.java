package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.User;
import com.albaag.todolistalba.model.UserRole;

/**
 * DTO de salida que representa un usuario.
 *
 * @param id        Identificador único del usuario
 * @param username  Nombre de usuario
 * @param email     Correo electrónico
 * @param fullname  Nombre completo
 * @param role      Rol del usuario (USER, ADMIN, GESTOR)
 * @param hasAvatar Indica si el usuario tiene avatar asignado
 */
public record UserResponse(
        Long id,
        String username,
        String email,
        String fullname,
        UserRole role,
        boolean hasAvatar) {

    /** Método factoría que convierte una entidad User en su DTO de respuesta. */
    public static UserResponse of(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullname(),
                user.getRole(),
                user.getAvatar() != null && user.getAvatar().length > 0);
    }
}
