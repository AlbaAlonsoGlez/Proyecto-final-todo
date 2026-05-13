package com.albaag.todolistalba.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import lombok.*;
import org.springframework.data.annotation.Id;

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
}
