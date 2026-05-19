package com.albaag.todolistalba.service;

import com.albaag.todolistalba.dto.TagRequest;
import com.albaag.todolistalba.dto.TagResponse;
import com.albaag.todolistalba.model.Tag;
import com.albaag.todolistalba.repos.TagRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepo tagRepository;

    public List<TagResponse> findAll() {
        return tagRepository.findAll()
                .stream()
                .map(TagResponse::of)
                .toList();
    }

    public TagResponse findById(Long id) {

        Tag tag = tagRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("El tag no ha sido encontrado :("));

        return TagResponse.of(tag);
    }

    public TagResponse create(TagRequest request) {

        Tag tag = Tag.builder()
                .name(request.getName())
                .color(request.getColor())
                .description(request.getDescription())
                .build();

        Tag saved = tagRepository.save(tag);

        return TagResponse.of(saved);
    }

    public TagResponse update(Long id, TagRequest request) {

        Tag tag = tagRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("El tag no ha sido encontrado :("));

        tag.setName(request.getName());
        tag.setColor(request.getColor());
        tag.setDescription(request.getDescription());

        Tag updated = tagRepository.save(tag);

        return TagResponse.of(updated);
    }

    public void delete(Long id) {

        Tag tag = tagRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("El tag no ha sido encontrado :("));

        tagRepository.delete(tag);
    }
}
