package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.User;
import com.albaag.todolistalba.model.UserRole;

public record UserResponse(
        Long id,
        String username,
        String email,
        UserRole role) {
    public static UserResponse of(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole());
    }
}
