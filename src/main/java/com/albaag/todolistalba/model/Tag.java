package com.albaag.todolistalba.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.ManyToMany;
import lombok.*;
import org.springframework.data.annotation.Id;

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

}
