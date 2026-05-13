package com.albaag.todolistalba.repos;

import com.albaag.todolistalba.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByUsernameOrEmail(String username, String email);
}
