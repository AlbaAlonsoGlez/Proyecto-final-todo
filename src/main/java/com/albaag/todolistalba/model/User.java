package com.albaag.todolistalba.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Table;
import lombok.*;
import org.springframework.data.annotation.Id;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@Entity
@Table(name="user_entity")
public class User {
    @Id
    @GeneratedValue
    private Long id;

    private String username, password, email, fullname;

    private UserRole role;
}
