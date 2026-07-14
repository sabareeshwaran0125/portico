package com.portico.backend.service;

import com.portico.backend.dto.VisitorDto;
import com.portico.backend.entity.Flat;
import com.portico.backend.entity.User;
import com.portico.backend.entity.Visitor;
import com.portico.backend.entity.VisitorApprovalStatus;
import com.portico.backend.exception.BadRequestException;
import com.portico.backend.exception.ResourceNotFoundException;
import com.portico.backend.repository.FlatRepository;
import com.portico.backend.repository.UserRepository;
import com.portico.backend.repository.VisitorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VisitorService {

    @Autowired
    private VisitorRepository visitorRepository;

    @Autowired
    private FlatRepository flatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public VisitorDto preApproveVisitor(VisitorDto dto, Long residentId) {
        Flat flat = flatRepository.findById(dto.getFlatId())
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        User host = userRepository.findById(residentId)
                .orElseThrow(() -> new ResourceNotFoundException("Host resident not found"));

        Visitor visitor = Visitor.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .flat(flat)
                .expectedArrival(dto.getExpectedArrival())
                .purpose(dto.getPurpose())
                .preApproved(true)
                .approvalStatus(VisitorApprovalStatus.APPROVED)
                .host(host)
                .build();

        Visitor saved = visitorRepository.save(visitor);
        return mapToDto(saved);
    }

    public List<VisitorDto> getExpectedVisitorsForToday() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        return visitorRepository.findExpectedVisitorsBetween(start, end).stream()
                .filter(v -> v.getEntryTime() == null)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<VisitorDto> getVisitorHistoryByHost(Long hostId) {
        return visitorRepository.findByHostId(hostId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<VisitorDto> getAllVisitorHistory() {
        return visitorRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VisitorDto logGateEntry(Long visitorId) {
        Visitor visitor = visitorRepository.findById(visitorId)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor pre-approval record not found"));

        if (visitor.getEntryTime() != null) {
            throw new BadRequestException("Visitor has already entered");
        }
        if (visitor.getApprovalStatus() != VisitorApprovalStatus.APPROVED) {
            throw new BadRequestException("Visitor is not approved by the resident");
        }

        visitor.setEntryTime(LocalDateTime.now());
        Visitor saved = visitorRepository.save(visitor);
        return mapToDto(saved);
    }

    @Transactional
    public VisitorDto requestWalkInApproval(VisitorDto dto) {
        Flat flat = flatRepository.findById(dto.getFlatId())
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        User host = flat.getResident();
        if (host == null) {
            throw new BadRequestException("No resident assigned to this flat to approve visitor");
        }

        Visitor visitor = Visitor.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .flat(flat)
                .expectedArrival(LocalDateTime.now())
                .purpose(dto.getPurpose())
                .preApproved(false)
                .approvalStatus(VisitorApprovalStatus.PENDING)
                .host(host)
                .build();

        Visitor saved = visitorRepository.save(visitor);
        
        notificationService.createNotification(host, "Visitor " + dto.getName() + " is at the gate. Please approve or deny.", "VISITOR");
        
        return mapToDto(saved);
    }
    
    @Transactional
    public VisitorDto updateApprovalStatus(Long visitorId, VisitorApprovalStatus status, Long residentId) {
        Visitor visitor = visitorRepository.findById(visitorId)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor not found"));

        if (!visitor.getHost().getId().equals(residentId)) {
            throw new BadRequestException("Not authorized");
        }

        visitor.setApprovalStatus(status);
        return mapToDto(visitorRepository.save(visitor));
    }

    @Transactional
    public VisitorDto logGateExit(Long visitorId) {
        Visitor visitor = visitorRepository.findById(visitorId)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor record not found"));

        if (visitor.getEntryTime() == null) {
            throw new BadRequestException("Visitor has not entered yet");
        }

        if (visitor.getExitTime() != null) {
            throw new BadRequestException("Visitor has already exited");
        }

        visitor.setExitTime(LocalDateTime.now());
        Visitor saved = visitorRepository.save(visitor);
        return mapToDto(saved);
    }

    private VisitorDto mapToDto(Visitor visitor) {
        return VisitorDto.builder()
                .id(visitor.getId())
                .name(visitor.getName())
                .phone(visitor.getPhone())
                .flatId(visitor.getFlat().getId())
                .flatDetails("Block " + visitor.getFlat().getBlock() + " - " + visitor.getFlat().getFlatNumber())
                .expectedArrival(visitor.getExpectedArrival())
                .purpose(visitor.getPurpose())
                .preApproved(visitor.getPreApproved())
                .approvalStatus(visitor.getApprovalStatus())
                .entryTime(visitor.getEntryTime())
                .exitTime(visitor.getExitTime())
                .hostId(visitor.getHost() != null ? visitor.getHost().getId() : null)
                .hostName(visitor.getHost() != null ? visitor.getHost().getFirstName() + " " + visitor.getHost().getLastName() : "Unassigned")
                .build();
    }
}
