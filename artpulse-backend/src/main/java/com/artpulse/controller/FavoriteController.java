package com.artpulse.controller;

import com.artpulse.entity.Favorite;
import com.artpulse.entity.FavoriteId;
import com.artpulse.entity.Product;
import com.artpulse.entity.User;
import com.artpulse.repository.FavoriteRepository;
import com.artpulse.repository.ProductRepository;
import com.artpulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // GET /api/favorites — returns list of product IDs favorited by the current user
    @GetMapping
    public ResponseEntity<?> getFavorites(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        List<Long> productIds = favoriteRepository.findByIdUserId(user.getId()).stream()
                .map(f -> f.getProduct().getId())
                .collect(Collectors.toList());
        return ResponseEntity.ok(productIds);
    }

    // POST /api/favorites/{productId} — adds product to favorites
    @PostMapping("/{productId}")
    public ResponseEntity<?> addFavorite(Authentication authentication, @PathVariable Long productId) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Product not found"));
        }
        
        boolean exists = favoriteRepository.existsByIdUserIdAndIdProductId(user.getId(), productId);
        if (!exists) {
            Favorite favorite = new Favorite();
            favorite.setId(new FavoriteId(user.getId(), productId));
            favorite.setUser(user);
            favorite.setProduct(product);
            favoriteRepository.save(favorite);
        }
        return ResponseEntity.ok(Map.of("message", "Product added to favorites"));
    }

    // DELETE /api/favorites/{productId} — removes product from favorites
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFavorite(Authentication authentication, @PathVariable Long productId) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        favoriteRepository.deleteByIdUserIdAndIdProductId(user.getId(), productId);
        return ResponseEntity.ok(Map.of("message", "Product removed from favorites"));
    }
}
