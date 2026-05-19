package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.User;
import com.albaag.todolistalba.model.UserRole;

public record UserResponse(
        Long id,
        String username,
        String email,
        String fullname,
        UserRole role,
        boolean hasAvatar) {
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
