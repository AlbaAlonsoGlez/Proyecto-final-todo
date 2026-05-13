package com.albaag.todolistalba.service;

import com.albaag.todolistalba.dto.CategoryRequest;
import com.albaag.todolistalba.dto.CategoryResponse;
import com.albaag.todolistalba.model.Category;
import com.albaag.todolistalba.repos.CategoryRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepo categoryRepository;

    public List<CategoryResponse> findAll() {

        return categoryRepository.findAll()
                .stream()
                .map(CategoryResponse::of)
                .toList();
    }

    public CategoryResponse findById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("La categoría no se ha encontrado :("));

        return CategoryResponse.of(category);
    }

    public CategoryResponse create(CategoryRequest request) {

        Category category = Category.builder()
                .title(request.getTitle())
                .build();

        Category saved = categoryRepository.save(category);

        return CategoryResponse.of(saved);
    }

    public CategoryResponse update(Long id, CategoryRequest request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("La categoría no se ha encontrado :("));

        category.setTitle(request.getTitle());

        Category updated = categoryRepository.save(category);

        return CategoryResponse.of(updated);
    }

    public void delete(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        categoryRepository.delete(category);
    }
}
