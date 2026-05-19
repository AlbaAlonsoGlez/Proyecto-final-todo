package com.albaag.todolistalba.controller;

import com.albaag.todolistalba.dto.CreateUserRequest;
import com.albaag.todolistalba.dto.UserResponse;
import com.albaag.todolistalba.service.UserService;
import com.albaag.todolistalba.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestión de usuarios (ADMIN) y perfil propio")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Listar todos los usuarios (ADMIN)")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @Operation(summary = "Obtener usuario por ID (ADMIN)")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @Operation(summary = "Crear usuario (ADMIN)")
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @Operation(summary = "Actualizar usuario (ADMIN)")
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @Operation(summary = "Eliminar usuario (ADMIN)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Promocionar usuario a GESTOR (ADMIN)")
    @PutMapping("/{id}/promote")
    public ResponseEntity<UserResponse> promote(@PathVariable Long id) {
        return ResponseEntity.ok(userService.promote(id));
    }

    @Operation(summary = "Degradar GESTOR a USER (ADMIN)")
    @PutMapping("/{id}/demote")
    public ResponseEntity<UserResponse> demote(@PathVariable Long id) {
        return ResponseEntity.ok(userService.demote(id));
    }

    @Operation(summary = "Obtener perfil propio")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @Operation(summary = "Actualizar perfil propio")
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @Valid @RequestBody CreateUserRequest request,
            Authentication auth) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), request));
    }

    @Operation(summary = "Subir avatar propio")
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {
        return ResponseEntity.ok(userService.uploadAvatar(auth.getName(), file));
    }

    @Operation(summary = "Eliminar avatar propio")
    @DeleteMapping("/me/avatar")
    public ResponseEntity<UserResponse> deleteAvatar(Authentication auth) {
        return ResponseEntity.ok(userService.deleteAvatar(auth.getName()));
    }

    @Operation(summary = "Obtener avatar de un usuario por ID")
    @GetMapping("/{id}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable Long id) {
        User user = userService.findEntityById(id);
        if (user.getAvatar() == null || user.getAvatar().length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(user.getAvatarContentType()))
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(user.getAvatar());
    }
}
