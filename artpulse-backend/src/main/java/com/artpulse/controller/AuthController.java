package com.artpulse.controller;

import com.artpulse.dto.JwtResponse;
import com.artpulse.dto.LoginRequest;
import com.artpulse.dto.RegisterRequest;
import com.artpulse.dto.ChangePasswordRequest;
import com.artpulse.dto.ForgotPasswordRequest;
import com.artpulse.entity.User;
import com.artpulse.entity.enums.Role;
import com.artpulse.repository.UserRepository;
import com.artpulse.security.JwtUtil;
import com.artpulse.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateJwtToken(authentication);

        // Creare si setare cookie HttpOnly
        Cookie cookie = new Cookie("jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 24 * 60 * 60); // 60 zile
        response.addCookie(cookie);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Extract role (we assume one role per user based on DB schema)
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFullName(),
                role));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (signUpRequest.getPassword() == null || signUpRequest.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body("Error: Password must be at least 8 characters!");
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        // Encode password using BCrypt (via DelegatingPasswordEncoder)
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setFullName(signUpRequest.getFullName());
        // user.setRole(Role.BIDDER); // Default role
        user.setFullName(signUpRequest.getFullName());
        user.setPhysicalAddress(signUpRequest.getPhysicalAddress());

        // Seteaza rolul din request (cu fallback la BIDDER)
        if (signUpRequest.getRole() != null) {
            try {
                user.setRole(Role.valueOf(signUpRequest.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(Role.BIDDER);
            }
        } else {
            user.setRole(Role.BIDDER);
        }

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    // POST /api/auth/change-password — schimbare parola (orice user autentificat)
    // Verifica parola curenta, seteaza parola noua si reseteaza flag-ul passwordResetRequired
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated."));
        }

        return userRepository.findByEmail(authentication.getName())
                .map(user -> {
                    // Verifica parola curenta (poate fi parola temporara sau cea normala)
                    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                        return ResponseEntity.badRequest().body(
                                Map.of("error", "Current password is incorrect."));
                    }
                    if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
                        return ResponseEntity.badRequest().body(
                                Map.of("error", "New password must be at least 8 characters."));
                    }
                    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    user.setPasswordResetRequired(false); // reseteaza flag-ul
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/auth/forgot-password — resetare automata a parolei
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    // Set a fixed temporary password
                    user.setPassword(passwordEncoder.encode("ResetPass@2026"));
                    user.setPasswordResetRequired(true);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Password has been reset to ResetPass@2026."));
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("error", "No user found with this email.")));
    }
}