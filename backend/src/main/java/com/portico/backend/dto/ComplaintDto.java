package com.portico.backend.dto;

import com.portico.backend.entity.ComplaintCategory;
import com.portico.backend.entity.ComplaintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ComplaintDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private ComplaintCategory category;

    private ComplaintStatus status;
    private Long raisedById;
    private String raisedByName;
    private String raisedByFlatDetails;
    private String imageUrl;
    private Integer resolutionTimeMinutes;
    private LocalDateTime createdAt;

    public ComplaintDto() {}

    public ComplaintDto(Long id, String title, String description, ComplaintCategory category, ComplaintStatus status, Long raisedById, String raisedByName, String raisedByFlatDetails, String imageUrl, Integer resolutionTimeMinutes, LocalDateTime createdAt) {
        this.id = id; this.title = title; this.description = description; this.category = category;
        this.status = status; this.raisedById = raisedById; this.raisedByName = raisedByName;
        this.raisedByFlatDetails = raisedByFlatDetails; this.imageUrl = imageUrl;
        this.resolutionTimeMinutes = resolutionTimeMinutes; this.createdAt = createdAt;
    }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public ComplaintCategory getCategory() { return category; } public void setCategory(ComplaintCategory category) { this.category = category; }
    public ComplaintStatus getStatus() { return status; } public void setStatus(ComplaintStatus status) { this.status = status; }
    public Long getRaisedById() { return raisedById; } public void setRaisedById(Long raisedById) { this.raisedById = raisedById; }
    public String getRaisedByName() { return raisedByName; } public void setRaisedByName(String raisedByName) { this.raisedByName = raisedByName; }
    public String getRaisedByFlatDetails() { return raisedByFlatDetails; } public void setRaisedByFlatDetails(String v) { this.raisedByFlatDetails = v; }
    public String getImageUrl() { return imageUrl; } public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getResolutionTimeMinutes() { return resolutionTimeMinutes; } public void setResolutionTimeMinutes(Integer v) { this.resolutionTimeMinutes = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ComplaintDtoBuilder builder() { return new ComplaintDtoBuilder(); }

    public static class ComplaintDtoBuilder {
        private Long id; private String title; private String description;
        private ComplaintCategory category; private ComplaintStatus status;
        private Long raisedById; private String raisedByName; private String raisedByFlatDetails;
        private String imageUrl; private Integer resolutionTimeMinutes; private LocalDateTime createdAt;

        public ComplaintDtoBuilder id(Long id) { this.id = id; return this; }
        public ComplaintDtoBuilder title(String title) { this.title = title; return this; }
        public ComplaintDtoBuilder description(String description) { this.description = description; return this; }
        public ComplaintDtoBuilder category(ComplaintCategory category) { this.category = category; return this; }
        public ComplaintDtoBuilder status(ComplaintStatus status) { this.status = status; return this; }
        public ComplaintDtoBuilder raisedById(Long raisedById) { this.raisedById = raisedById; return this; }
        public ComplaintDtoBuilder raisedByName(String raisedByName) { this.raisedByName = raisedByName; return this; }
        public ComplaintDtoBuilder raisedByFlatDetails(String v) { this.raisedByFlatDetails = v; return this; }
        public ComplaintDtoBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ComplaintDtoBuilder resolutionTimeMinutes(Integer v) { this.resolutionTimeMinutes = v; return this; }
        public ComplaintDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ComplaintDto build() { return new ComplaintDto(id, title, description, category, status, raisedById, raisedByName, raisedByFlatDetails, imageUrl, resolutionTimeMinutes, createdAt); }
    }
}
