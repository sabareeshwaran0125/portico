package com.portico.backend.controller;

import com.portico.backend.dto.NoticeDto;
import com.portico.backend.security.UserPrincipal;
import com.portico.backend.service.NoticeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NoticeDto> createNotice(
            @Valid @RequestBody NoticeDto noticeDto,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(noticeService.createNotice(noticeDto, principal.getId()), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESIDENT')")
    public ResponseEntity<List<NoticeDto>> getNotices(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal.getUser().getRole().name().equals("ADMIN")) {
            return ResponseEntity.ok(noticeService.getAllNoticesAdmin());
        } else {
            return ResponseEntity.ok(noticeService.getActiveNotices(principal.getId()));
        }
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<Map<String, String>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        noticeService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Notice marked as read"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok(Map.of("message", "Notice deleted successfully"));
    }
}
