package com.albaag.todolistalba.dto;

import com.albaag.todolistalba.model.Tag;

public record TagResponse(Long id, String name, String color, String description) {
    public static TagResponse of(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor(), tag.getDescription());
    }
}
