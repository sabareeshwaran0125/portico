package com.portico.backend.controller;

import com.portico.backend.dto.FlatDto;
import com.portico.backend.dto.VisitorDto;
import com.portico.backend.service.FlatService;
import com.portico.backend.service.VisitorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guard")
@PreAuthorize("hasRole('GUARD')")
public class GuardController {

    @Autowired
    private VisitorService visitorService;

    @Autowired
    private FlatService flatService;

    @GetMapping("/flats")
    public ResponseEntity<List<FlatDto>> getAllFlats() {
        return ResponseEntity.ok(flatService.getAllFlats());
    }

    @GetMapping("/visitors/expected")
    public ResponseEntity<List<VisitorDto>> getExpectedVisitors() {
        return ResponseEntity.ok(visitorService.getExpectedVisitorsForToday());
    }

    @PostMapping("/visitors/{id}/entry")
    public ResponseEntity<VisitorDto> logEntry(@PathVariable Long id) {
        return ResponseEntity.ok(visitorService.logGateEntry(id));
    }

    @PostMapping("/visitors/{id}/exit")
    public ResponseEntity<VisitorDto> logExit(@PathVariable Long id) {
        return ResponseEntity.ok(visitorService.logGateExit(id));
    }

    @PostMapping("/visitors/walk-in")
    public ResponseEntity<VisitorDto> logWalkIn(@Valid @RequestBody VisitorDto visitorDto) {
        return ResponseEntity.ok(visitorService.requestWalkInApproval(visitorDto));
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<VisitorDto>> getVisitorLogs() {
        return ResponseEntity.ok(visitorService.getAllVisitorHistory());
    }
}
