package com.albaag.todolistalba.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@Entity
public class Category {
    @Id
    @GeneratedValue
    private Long id;

    private String title;

    @Column(length = 7)
    private String color;

    @Column(length = 255)
    private String description;
}
