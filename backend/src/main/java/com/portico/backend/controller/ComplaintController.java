package com.portico.backend.controller;

import com.portico.backend.dto.ComplaintDto;
import com.portico.backend.entity.ComplaintStatus;
import com.portico.backend.security.UserPrincipal;
import com.portico.backend.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ComplaintDto> raiseComplaint(
            @RequestPart("complaint") @Valid ComplaintDto complaintDto,
            @RequestPart(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(complaintService.raiseComplaint(complaintDto, file, principal.getId()), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESIDENT')")
    public ResponseEntity<List<ComplaintDto>> getComplaints(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal.getUser().getRole().name().equals("ADMIN")) {
            return ResponseEntity.ok(complaintService.getAllComplaints());
        } else {
            return ResponseEntity.ok(complaintService.getResidentComplaints(principal.getId()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintDto> updateStatus(
            @PathVariable Long id,
            @RequestParam ComplaintStatus status) {
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, status));
    }
}
