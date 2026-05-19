package com.albaag.todolistalba.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@Entity
public class Tag {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @Column(length = 7)
    private String color;

    @Column(length = 255)
    private String description;

}
