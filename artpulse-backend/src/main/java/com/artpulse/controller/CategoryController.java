package com.artpulse.controller;

import com.artpulse.entity.Category;
import com.artpulse.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            return ResponseEntity.badRequest().body("Category already exists");
        }
        return ResponseEntity.ok(categoryRepository.save(category));
    }
}
