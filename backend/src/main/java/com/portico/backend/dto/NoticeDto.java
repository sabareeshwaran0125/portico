package com.portico.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class NoticeDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String attachmentUrl;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private Boolean read;

    public NoticeDto() {}

    public NoticeDto(Long id, String title, String content, String attachmentUrl, LocalDate expiryDate, Long createdById, String createdByName, LocalDateTime createdAt, Boolean read) {
        this.id = id; this.title = title; this.content = content; this.attachmentUrl = attachmentUrl;
        this.expiryDate = expiryDate; this.createdById = createdById; this.createdByName = createdByName;
        this.createdAt = createdAt; this.read = read;
    }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; } public void setContent(String content) { this.content = content; }
    public String getAttachmentUrl() { return attachmentUrl; } public void setAttachmentUrl(String v) { this.attachmentUrl = v; }
    public LocalDate getExpiryDate() { return expiryDate; } public void setExpiryDate(LocalDate v) { this.expiryDate = v; }
    public Long getCreatedById() { return createdById; } public void setCreatedById(Long v) { this.createdById = v; }
    public String getCreatedByName() { return createdByName; } public void setCreatedByName(String v) { this.createdByName = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public Boolean getRead() { return read; } public void setRead(Boolean read) { this.read = read; }

    public static NoticeDtoBuilder builder() { return new NoticeDtoBuilder(); }

    public static class NoticeDtoBuilder {
        private Long id; private String title; private String content; private String attachmentUrl;
        private LocalDate expiryDate; private Long createdById; private String createdByName;
        private LocalDateTime createdAt; private Boolean read;

        public NoticeDtoBuilder id(Long id) { this.id = id; return this; }
        public NoticeDtoBuilder title(String title) { this.title = title; return this; }
        public NoticeDtoBuilder content(String content) { this.content = content; return this; }
        public NoticeDtoBuilder attachmentUrl(String v) { this.attachmentUrl = v; return this; }
        public NoticeDtoBuilder expiryDate(LocalDate v) { this.expiryDate = v; return this; }
        public NoticeDtoBuilder createdById(Long v) { this.createdById = v; return this; }
        public NoticeDtoBuilder createdByName(String v) { this.createdByName = v; return this; }
        public NoticeDtoBuilder createdAt(LocalDateTime v) { this.createdAt = v; return this; }
        public NoticeDtoBuilder read(Boolean read) { this.read = read; return this; }
        public NoticeDto build() { return new NoticeDto(id, title, content, attachmentUrl, expiryDate, createdById, createdByName, createdAt, read); }
    }
}
