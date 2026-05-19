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
@Table(name="user_entity")
public class User {
    @Id
    @GeneratedValue
    private Long id;

    private String username, password, email, fullname;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] avatar;

    private String avatarContentType;
}
