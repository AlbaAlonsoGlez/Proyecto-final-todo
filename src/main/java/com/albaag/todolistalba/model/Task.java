package com.albaag.todolistalba.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@Entity
public class Task {
    @Id
    @GeneratedValue
    private Long id;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    private String title;

    @Lob
    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    private LocalDateTime deadline;

}
