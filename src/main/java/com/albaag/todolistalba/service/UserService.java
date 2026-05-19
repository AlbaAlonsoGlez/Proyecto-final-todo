package com.albaag.todolistalba.service;

import com.albaag.todolistalba.dto.CreateUserRequest;
import com.albaag.todolistalba.dto.UserResponse;
import com.albaag.todolistalba.model.User;
import com.albaag.todolistalba.model.UserRole;
import com.albaag.todolistalba.repos.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(CreateUserRequest request) {
        UserRole role = UserRole.USER;
        if (request.getRole() != null) {
            role = UserRole.valueOf(request.getRole());
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullname(request.getFullname())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        return UserResponse.of(userRepo.save(user));
    }

    public List<UserResponse> findAll() {
        return userRepo.findAll().stream().map(UserResponse::of).toList();
    }

    public UserResponse findById(Long id) {
        return UserResponse.of(userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
    }

    public UserResponse update(Long id, CreateUserRequest request) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getFullname() != null) user.setFullname(request.getFullname());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(UserRole.valueOf(request.getRole()));
        }
        return UserResponse.of(userRepo.save(user));
    }

    public void delete(Long id) {
        userRepo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        userRepo.deleteById(id);
    }

    public UserResponse promote(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setRole(UserRole.GESTOR);
        return UserResponse.of(userRepo.save(user));
    }

    public UserResponse demote(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setRole(UserRole.USER);
        return UserResponse.of(userRepo.save(user));
    }

    public UserResponse getProfile(String username) {
        User user = userRepo.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return UserResponse.of(user);
    }

    public UserResponse updateProfile(String username, CreateUserRequest request) {
        User user = userRepo.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getFullname() != null) user.setFullname(request.getFullname());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return UserResponse.of(userRepo.save(user));
    }

    public UserResponse uploadAvatar(String username, MultipartFile file) throws IOException {
        User user = userRepo.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setAvatar(file.getBytes());
        user.setAvatarContentType(file.getContentType());
        return UserResponse.of(userRepo.save(user));
    }

    public UserResponse deleteAvatar(String username) {
        User user = userRepo.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setAvatar(null);
        user.setAvatarContentType(null);
        return UserResponse.of(userRepo.save(user));
    }

    public User findEntityByUsername(String username) {
        return userRepo.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public User findEntityById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
