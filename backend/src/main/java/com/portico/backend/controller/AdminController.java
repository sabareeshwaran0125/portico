package com.portico.backend.controller;

import com.portico.backend.dto.AnalyticsResponse;
import com.portico.backend.dto.BillDto;
import com.portico.backend.dto.FlatDto;
import com.portico.backend.dto.UserDto;
import com.portico.backend.dto.VisitorDto;
import com.portico.backend.entity.Role;
import com.portico.backend.entity.User;
import com.portico.backend.repository.UserRepository;
import com.portico.backend.service.AnalyticsService;
import com.portico.backend.service.AuthService;
import com.portico.backend.service.BillService;
import com.portico.backend.service.FlatService;
import com.portico.backend.service.VisitorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private FlatService flatService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BillService billService;

    @Autowired
    private VisitorService visitorService;

    @Autowired
    private AnalyticsService analyticsService;

    // --- Flat Management ---

    @PostMapping("/flats")
    public ResponseEntity<FlatDto> createFlat(@Valid @RequestBody FlatDto flatDto) {
        return new ResponseEntity<>(flatService.createFlat(flatDto), HttpStatus.CREATED);
    }

    @GetMapping("/flats")
    public ResponseEntity<List<FlatDto>> getAllFlats() {
        return ResponseEntity.ok(flatService.getAllFlats());
    }

    @PutMapping("/flats/{id}")
    public ResponseEntity<FlatDto> updateFlat(@PathVariable Long id, @Valid @RequestBody FlatDto flatDto) {
        return ResponseEntity.ok(flatService.updateFlat(id, flatDto));
    }

    @DeleteMapping("/flats/{id}")
    public ResponseEntity<Map<String, String>> deleteFlat(@PathVariable Long id) {
        flatService.deleteFlat(id);
        return ResponseEntity.ok(Map.of("message", "Flat deleted successfully"));
    }

    @PutMapping("/flats/{flatId}/assign")
    public ResponseEntity<FlatDto> assignResident(@PathVariable Long flatId, @RequestParam(required = false) Long residentId) {
        return ResponseEntity.ok(flatService.assignResident(flatId, residentId));
    }

    // --- Onboarding Users ---

    @PostMapping("/onboard")
    public ResponseEntity<UserDto> onboardUser(@Valid @RequestBody UserDto userDto) {
        // Enforce role assignment in service
        return new ResponseEntity<>(authService.register(userDto), HttpStatus.CREATED);
    }

    @GetMapping("/residents")
    public ResponseEntity<List<UserDto>> getResidents() {
        List<UserDto> residents = userRepository.findByRole(Role.RESIDENT).stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .phone(u.getPhone())
                        .role(u.getRole())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(residents);
    }

    @GetMapping("/guards")
    public ResponseEntity<List<UserDto>> getGuards() {
        List<UserDto> guards = userRepository.findByRole(Role.GUARD).stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .phone(u.getPhone())
                        .role(u.getRole())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(guards);
    }

    @GetMapping("/users/pending")
    public ResponseEntity<List<UserDto>> getPendingUsers() {
        List<UserDto> pending = userRepository.findByIsApprovedFalse().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .phone(u.getPhone())
                        .role(u.getRole())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<Map<String, String>> approveUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.portico.backend.exception.ResourceNotFoundException("User not found"));
        user.setApproved(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User approved successfully"));
    }

    // --- Billing Management ---

    @PostMapping("/bills/generate")
    public ResponseEntity<List<BillDto>> generateMonthlyBills(
            @RequestParam String billingMonth,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam BigDecimal ratePerSqFt) {
        List<BillDto> bills = billService.generateMonthlyBills(billingMonth, dueDate, ratePerSqFt);
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/bills")
    public ResponseEntity<List<BillDto>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    // --- Visitor Audit ---

    @GetMapping("/visitors")
    public ResponseEntity<List<VisitorDto>> getAllVisitorHistory() {
        return ResponseEntity.ok(visitorService.getAllVisitorHistory());
    }

    // --- Analytics Dashboard ---

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getDashboardAnalytics() {
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics());
    }
}
