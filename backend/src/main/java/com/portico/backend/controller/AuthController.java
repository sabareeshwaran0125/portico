package com.portico.backend.controller;

import com.portico.backend.dto.LoginRequest;
import com.portico.backend.dto.LoginResponse;
import com.portico.backend.dto.RegisterRequest;
import com.portico.backend.service.AuthService;
import com.portico.backend.service.FlatService;
import com.portico.backend.dto.FlatDto;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private FlatService flatService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.registerResident(registerRequest);
        return ResponseEntity.ok(Map.of("message", "Registration successful. Please wait for admin approval."));
    }

    @GetMapping("/flats/unoccupied")
    public ResponseEntity<List<FlatDto>> getUnoccupiedFlats() {
        return ResponseEntity.ok(flatService.getUnoccupiedFlats());
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Refresh token is required"));
        }
        String newAccessToken = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email != null && !email.isEmpty()) {
            authService.forgotPassword(email);
        }
        return ResponseEntity.ok(Map.of("message", "If the email exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        if (token == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request parameters"));
        }
        
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password has been successfully reset."));
    }
}
