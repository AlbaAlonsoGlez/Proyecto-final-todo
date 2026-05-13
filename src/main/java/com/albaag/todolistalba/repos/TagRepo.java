package com.albaag.todolistalba.repos;

import com.albaag.todolistalba.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepo extends JpaRepository<Tag, Long> {
    Optional<Tag> findByName(String name);
}
