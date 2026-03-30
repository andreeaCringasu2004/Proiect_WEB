package com.artpulse.dto;

import lombok.Data;

@Data // aceasta adnotare din Lombok genereaza automat Getters și Setters
public class LoginRequest {
    private String email;
    private String password;
}