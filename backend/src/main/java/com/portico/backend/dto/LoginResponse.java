package com.portico.backend.dto;

public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private String role;
    private String name;
    private Long userId;

    // Constructors
    public LoginResponse() {
    }

    public LoginResponse(String accessToken, String refreshToken, String email, String role, String name, Long userId) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.email = email;
        this.role = role;
        this.name = name;
        this.userId = userId;
    }

    // Getters and Setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    // Builder Implementation
    public static LoginResponseBuilder builder() {
        return new LoginResponseBuilder();
    }

    public static class LoginResponseBuilder {
        private String accessToken;
        private String refreshToken;
        private String email;
        private String role;
        private String name;
        private Long userId;

        public LoginResponseBuilder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public LoginResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
        public LoginResponseBuilder email(String email) { this.email = email; return this; }
        public LoginResponseBuilder role(String role) { this.role = role; return this; }
        public LoginResponseBuilder name(String name) { this.name = name; return this; }
        public LoginResponseBuilder userId(Long userId) { this.userId = userId; return this; }

        public LoginResponse build() {
            return new LoginResponse(accessToken, refreshToken, email, role, name, userId);
        }
    }
}
