package com.portico.backend.service;

import com.portico.backend.dto.LoginRequest;
import com.portico.backend.dto.LoginResponse;
import com.portico.backend.entity.Role;
import com.portico.backend.entity.User;
import com.portico.backend.repository.UserRepository;
import com.portico.backend.security.JwtUtil;
import com.portico.backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testLogin_Success() {
        User user = User.builder()
                .id(1L).email("admin@test.com")
                .firstName("Admin").lastName("User")
                .phone("9999999999").role(Role.ADMIN).build();

        UserPrincipal principal = new UserPrincipal(user);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtil.generateAccessToken(any(Authentication.class))).thenReturn("mock-access-token");
        when(jwtUtil.generateRefreshToken("admin@test.com")).thenReturn("mock-refresh-token");

        LoginRequest request = new LoginRequest("admin@test.com", "password");
        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-access-token", response.getAccessToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        assertEquals("admin@test.com", response.getEmail());
        assertEquals("ADMIN", response.getRole());
        assertEquals("Admin User", response.getName());
        assertEquals(1L, response.getUserId());
    }
}
