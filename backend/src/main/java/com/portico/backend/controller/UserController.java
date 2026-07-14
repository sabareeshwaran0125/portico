package com.portico.backend.controller;

import com.portico.backend.dto.UserDto;
import com.portico.backend.security.UserPrincipal;
import com.portico.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getUserProfile(principal.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto userDto,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.updateProfile(principal.getId(), userDto));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> updatePassword(@RequestBody Map<String, String> request,
                                                              @AuthenticationPrincipal UserPrincipal principal) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        
        if (oldPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid password parameters"));
        }
        
        authService.updatePassword(principal.getId(), oldPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
