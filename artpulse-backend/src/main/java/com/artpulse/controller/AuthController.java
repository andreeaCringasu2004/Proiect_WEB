package com.artpulse.controller;

import com.artpulse.dto.LoginRequest;
import com.artpulse.dto.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest loginRequest) {
        // MOMENTAN: Simulează un succes pentru testare
        // Ulterior, aici vom căuta în baza de date MySQL

        UserResponse mockUser = new UserResponse(
                1L,
                loginRequest.getEmail(),
                "Utilizator Test",
                "ADMIN"
        );

        return ResponseEntity.ok(mockUser);
    }
}