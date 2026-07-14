package com.portico.backend.service;

import com.portico.backend.dto.ComplaintDto;
import com.portico.backend.entity.Complaint;
import com.portico.backend.entity.ComplaintStatus;
import com.portico.backend.entity.Flat;
import com.portico.backend.entity.User;
import com.portico.backend.exception.ResourceNotFoundException;
import com.portico.backend.repository.ComplaintRepository;
import com.portico.backend.repository.FlatRepository;
import com.portico.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlatRepository flatRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ComplaintDto raiseComplaint(ComplaintDto dto, org.springframework.web.multipart.MultipartFile file, Long userId) {
        User resident = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resident not found"));

        String imageUrl = dto.getImageUrl();
        if (file != null && !file.isEmpty()) {
            try {
                // Simplified for local dev: save to a local 'uploads' directory
                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads");
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                String fileName = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                java.nio.file.Path filePath = uploadPath.resolve(fileName);
                java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                
                // Set the URL that the frontend can use to access it (assuming static resource mapping or just returning the path for now)
                imageUrl = "/uploads/" + fileName;
            } catch (java.io.IOException e) {
                // Log and ignore for now, or throw custom exception
                e.printStackTrace();
            }
        }

        Complaint complaint = Complaint.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .status(ComplaintStatus.OPEN)
                .raisedBy(resident)
                .imageUrl(imageUrl)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        return mapToDto(saved);
    }

    public List<ComplaintDto> getResidentComplaints(Long userId) {
        return complaintRepository.findByRaisedById(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ComplaintDto> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintDto updateComplaintStatus(Long id, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        complaint.setStatus(status);

        if (status == ComplaintStatus.RESOLVED) {
            long minutes = Duration.between(complaint.getCreatedAt(), LocalDateTime.now()).toMinutes();
            // Fallback to at least 1 minute if resolved immediately
            complaint.setResolutionTimeMinutes(Math.max(1, (int) minutes));
        }

        Complaint updated = complaintRepository.save(complaint);
        
        notificationService.createNotification(complaint.getRaisedBy(), "Your complaint '" + complaint.getTitle() + "' status changed to " + status.name(), "COMPLAINT_UPDATE");
        
        return mapToDto(updated);
    }

    private ComplaintDto mapToDto(Complaint complaint) {
        // Query flat for flat details
        List<Flat> flats = flatRepository.findByResidentId(complaint.getRaisedBy().getId());
        String flatDetails = flats.isEmpty() ? "External/Unassigned" 
                : "Block " + flats.get(0).getBlock() + " - " + flats.get(0).getFlatNumber();

        return ComplaintDto.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .status(complaint.getStatus())
                .raisedById(complaint.getRaisedBy().getId())
                .raisedByName(complaint.getRaisedBy().getFirstName() + " " + complaint.getRaisedBy().getLastName())
                .raisedByFlatDetails(flatDetails)
                .imageUrl(complaint.getImageUrl())
                .resolutionTimeMinutes(complaint.getResolutionTimeMinutes())
                .createdAt(complaint.getCreatedAt())
                .build();
    }
}
