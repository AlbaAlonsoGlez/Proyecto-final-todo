package com.albaag.todolistalba.model;

import jakarta.persistence.*;
import lombok.*;

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

    private boolean completed;

    @ManyToOne
    private User author;

    @Lob
    private String description;

    @Lob
    private String comments;

    private boolean important;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    private LocalDateTime deadline;

    @ManyToMany
    @JoinTable(
            name = "taskCategory",
            joinColumns = @JoinColumn(name = "taskId"),
            inverseJoinColumns = @JoinColumn(name = "categoryId")
    )
    private Set<Category> categories = new HashSet<>();

    @ManyToMany
    private Set<Tag> tags = new HashSet<>();

}
