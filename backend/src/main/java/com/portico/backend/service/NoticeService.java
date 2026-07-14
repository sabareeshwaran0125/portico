package com.portico.backend.service;

import com.portico.backend.dto.NoticeDto;
import com.portico.backend.entity.Notice;
import com.portico.backend.entity.NoticeRead;
import com.portico.backend.entity.User;
import com.portico.backend.exception.BadRequestException;
import com.portico.backend.exception.ResourceNotFoundException;
import com.portico.backend.repository.NoticeReadRepository;
import com.portico.backend.repository.NoticeRepository;
import com.portico.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private NoticeReadRepository noticeReadRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public NoticeDto createNotice(NoticeDto dto, Long userId) {
        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin creator not found"));

        Notice notice = Notice.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .attachmentUrl(dto.getAttachmentUrl())
                .expiryDate(dto.getExpiryDate())
                .createdBy(admin)
                .build();

        Notice saved = noticeRepository.save(notice);
        return mapToDto(saved, null);
    }

    public List<NoticeDto> getActiveNotices(Long currentUserId) {
        LocalDate today = LocalDate.now();
        List<Notice> notices = noticeRepository.findActiveNotices(today);
        return notices.stream()
                .map(n -> mapToDto(n, currentUserId))
                .collect(Collectors.toList());
    }

    public List<NoticeDto> getAllNoticesAdmin() {
        return noticeRepository.findAll().stream()
                .map(n -> mapToDto(n, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long noticeId, Long userId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!noticeReadRepository.existsByNoticeIdAndUserId(noticeId, userId)) {
            NoticeRead readLog = NoticeRead.builder()
                    .notice(notice)
                    .user(user)
                    .build();
            noticeReadRepository.save(readLog);
        }
    }

    @Transactional
    public void deleteNotice(Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notice not found");
        }
        noticeRepository.deleteById(id);
    }

    private NoticeDto mapToDto(Notice notice, Long currentUserId) {
        Boolean isRead = false;
        if (currentUserId != null) {
            isRead = noticeReadRepository.existsByNoticeIdAndUserId(notice.getId(), currentUserId);
        }

        return NoticeDto.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .attachmentUrl(notice.getAttachmentUrl())
                .expiryDate(notice.getExpiryDate())
                .createdById(notice.getCreatedBy().getId())
                .createdByName(notice.getCreatedBy().getFirstName() + " " + notice.getCreatedBy().getLastName())
                .createdAt(notice.getCreatedAt())
                .read(isRead)
                .build();
    }
}
