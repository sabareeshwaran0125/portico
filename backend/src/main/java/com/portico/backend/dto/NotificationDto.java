package com.portico.backend.dto;

import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private String message;
    private String type;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationDto() {}

    public NotificationDto(Long id, String message, String type, boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.read = read;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
