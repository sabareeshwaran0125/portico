package com.portico.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FlatDto {
    private Long id;

    @NotBlank(message = "Block is required")
    private String block;

    @NotBlank(message = "Flat number is required")
    private String flatNumber;

    @NotNull(message = "Size is required")
    @Min(value = 1, message = "Size must be positive")
    private Double sizeSqft;

    @NotBlank(message = "Flat type is required")
    private String flatType; // "1BHK", "2BHK", etc.

    private Long residentId;
    private String residentName;
    private String residentEmail;

    // Constructors
    public FlatDto() {
    }

    public FlatDto(Long id, String block, String flatNumber, Double sizeSqft, String flatType, Long residentId, String residentName, String residentEmail) {
        this.id = id;
        this.block = block;
        this.flatNumber = flatNumber;
        this.sizeSqft = sizeSqft;
        this.flatType = flatType;
        this.residentId = residentId;
        this.residentName = residentName;
        this.residentEmail = residentEmail;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

    public Double getSizeSqft() { return sizeSqft; }
    public void setSizeSqft(Double sizeSqft) { this.sizeSqft = sizeSqft; }

    public String getFlatType() { return flatType; }
    public void setFlatType(String flatType) { this.flatType = flatType; }

    public Long getResidentId() { return residentId; }
    public void setResidentId(Long residentId) { this.residentId = residentId; }

    public String getResidentName() { return residentName; }
    public void setResidentName(String residentName) { this.residentName = residentName; }

    public String getResidentEmail() { return residentEmail; }
    public void setResidentEmail(String residentEmail) { this.residentEmail = residentEmail; }

    // Builder Implementation
    public static FlatDtoBuilder builder() {
        return new FlatDtoBuilder();
    }

    public static class FlatDtoBuilder {
        private Long id;
        private String block;
        private String flatNumber;
        private Double sizeSqft;
        private String flatType;
        private Long residentId;
        private String residentName;
        private String residentEmail;

        public FlatDtoBuilder id(Long id) { this.id = id; return this; }
        public FlatDtoBuilder block(String block) { this.block = block; return this; }
        public FlatDtoBuilder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
        public FlatDtoBuilder sizeSqft(Double sizeSqft) { this.sizeSqft = sizeSqft; return this; }
        public FlatDtoBuilder flatType(String flatType) { this.flatType = flatType; return this; }
        public FlatDtoBuilder residentId(Long residentId) { this.residentId = residentId; return this; }
        public FlatDtoBuilder residentName(String residentName) { this.residentName = residentName; return this; }
        public FlatDtoBuilder residentEmail(String residentEmail) { this.residentEmail = residentEmail; return this; }

        public FlatDto build() {
            return new FlatDto(id, block, flatNumber, sizeSqft, flatType, residentId, residentName, residentEmail);
        }
    }
}
