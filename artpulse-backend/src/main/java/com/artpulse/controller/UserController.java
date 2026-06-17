package com.artpulse.controller;

import com.artpulse.entity.User;
import com.artpulse.entity.enums.Role;
import com.artpulse.entity.enums.UserStatus;
import com.artpulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // GET /api/users/me — profilul utilizatorului curent (necesita JWT)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/users/me — actualizeaza profilul utilizatorului curent (necesita JWT)
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Authentication authentication,
                                               @RequestBody Map<String, String> body) {
        return userRepository.findByEmail(authentication.getName()).map(user -> {
            if (body.containsKey("fullName") && body.get("fullName") != null && !body.get("fullName").isBlank()) {
                user.setFullName(body.get("fullName"));
            }
            // Email update only if changed and not already taken
            if (body.containsKey("email") && body.get("email") != null && !body.get("email").isBlank()) {
                String newEmail = body.get("email").trim().toLowerCase();
                if (!newEmail.equals(user.getEmail())) {
                    boolean taken = userRepository.findByEmail(newEmail).isPresent();
                    if (taken) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Email already in use."));
                    }
                    user.setEmail(newEmail);
                }
            }
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully.",
                "fullName", user.getFullName(),
                "email", user.getEmail()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // GET /api/users/admin/all — toti utilizatorii (doar ADMIN)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // PUT /api/users/{id}/role — schimba rolul unui user (doar ADMIN)
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String roleStr = body.get("role");
        if (roleStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required."));
        }
        return userRepository.findById(id).map(user -> {
            try {
                user.setRole(Role.valueOf(roleStr.toUpperCase()));
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Role updated successfully.", "userId", id, "newRole", roleStr));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + roleStr));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/users/{id}/status — activeaza/dezactiveaza user (doar ADMIN)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String statusStr = body.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required."));
        }
        return userRepository.findById(id).map(user -> {
            try {
                user.setStatus(UserStatus.valueOf(statusStr.toUpperCase()));
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Status updated.", "userId", id, "newStatus", statusStr));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + statusStr));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/users/{id} — sterge user (doar ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setStatus(UserStatus.DEACTIVATED);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User deactivated successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // POST /api/users/{id}/reset-password — resetare parola de catre ADMIN
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            if (user.getRole().name().equals("ADMIN")) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Cannot reset admin password."));
            }
            String temporaryPassword = "ResetPass@2026";
            user.setPassword(passwordEncoder.encode(temporaryPassword));
            user.setPasswordResetRequired(true);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset successfully.",
                    "temporaryPassword", temporaryPassword,
                    "userId", user.getId(),
                    "userEmail", user.getEmail()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}
