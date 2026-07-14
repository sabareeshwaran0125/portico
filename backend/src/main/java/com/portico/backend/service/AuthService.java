package com.portico.backend.service;

import com.portico.backend.dto.LoginRequest;
import com.portico.backend.dto.LoginResponse;
import com.portico.backend.dto.RegisterRequest;
import com.portico.backend.dto.UserDto;
import com.portico.backend.entity.Flat;
import com.portico.backend.entity.Role;
import com.portico.backend.entity.User;
import com.portico.backend.exception.BadRequestException;
import com.portico.backend.exception.ResourceNotFoundException;
import com.portico.backend.repository.FlatRepository;
import com.portico.backend.repository.UserRepository;
import com.portico.backend.repository.PasswordResetTokenRepository;
import com.portico.backend.entity.PasswordResetToken;
import com.portico.backend.security.JwtUtil;
import com.portico.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private FlatRepository flatRepository;

    @Transactional
    public void registerResident(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(Role.RESIDENT)
                .isApproved(false)
                .build();

        User savedUser = userRepository.save(user);

        if (request.getFlatBlock() == null || request.getFlatBlock().trim().isEmpty() || 
            request.getFlatNumber() == null || request.getFlatNumber().trim().isEmpty()) {
            throw new BadRequestException("Flat block and flat number are required");
        }

        Flat flat = flatRepository.findByBlockAndFlatNumber(request.getFlatBlock(), request.getFlatNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));
        
        if (flat.getResident() != null) {
            throw new BadRequestException("Flat is already occupied");
        }

        flat.setResident(savedUser);
        flatRepository.save(flat);
    }

    @Transactional
    public UserDto register(UserDto userDto) {
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        User user = User.builder()
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .phone(userDto.getPhone())
                .role(userDto.getRole())
                .shift(userDto.getShift())
                .isApproved(true)
                .build();

        User savedUser = userRepository.save(user);

        return mapToDto(savedUser);
    }

    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();

        String accessToken = jwtUtil.generateAccessToken(authentication);
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .name(user.getFirstName() + " " + user.getLastName())
                .userId(user.getId())
                .build();
    }

    public String refreshAccessToken(String refreshToken) {
        if (jwtUtil.validateToken(refreshToken)) {
            String email = jwtUtil.getEmailFromToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            // Generate a new access token
            return jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name(), user.getId());
        }
        throw new BadRequestException("Invalid refresh token");
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // For security, don't reveal user existence
            return;
        }

        tokenRepository.deleteByUser_Id(user.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(24));
        tokenRepository.save(resetToken);

        // Simulate sending email
        System.out.println("\n================================================");
        System.out.println("PASSWORD RESET EMAIL FOR: " + email);
        System.out.println("RESET TOKEN: " + token);
        System.out.println("URL: http://localhost:5173/reset-password?token=" + token);
        System.out.println("================================================\n");
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new BadRequestException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }

    public UserDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateProfile(Long userId, UserDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public void updatePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Incorrect old password");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole())
                .shift(user.getShift())
                .build();
    }
}
