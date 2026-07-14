package com.portico.backend.dto;

import com.portico.backend.entity.VisitorApprovalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class VisitorDto {
    private Long id;

    @NotBlank(message = "Visitor name is required")
    private String name;

    @NotBlank(message = "Visitor phone number is required")
    private String phone;

    @NotNull(message = "Flat ID is required")
    private Long flatId;

    private String flatDetails;

    @NotNull(message = "Expected arrival time is required")
    private LocalDateTime expectedArrival;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    private Boolean preApproved;
    private VisitorApprovalStatus approvalStatus;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private Long hostId;
    private String hostName;

    // Constructors
    public VisitorDto() {
    }

    public VisitorDto(Long id, String name, String phone, Long flatId, String flatDetails, LocalDateTime expectedArrival, String purpose, Boolean preApproved, VisitorApprovalStatus approvalStatus, LocalDateTime entryTime, LocalDateTime exitTime, Long hostId, String hostName) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.flatId = flatId;
        this.flatDetails = flatDetails;
        this.expectedArrival = expectedArrival;
        this.purpose = purpose;
        this.preApproved = preApproved;
        this.approvalStatus = approvalStatus;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
        this.hostId = hostId;
        this.hostName = hostName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Long getFlatId() { return flatId; }
    public void setFlatId(Long flatId) { this.flatId = flatId; }

    public String getFlatDetails() { return flatDetails; }
    public void setFlatDetails(String flatDetails) { this.flatDetails = flatDetails; }

    public LocalDateTime getExpectedArrival() { return expectedArrival; }
    public void setExpectedArrival(LocalDateTime expectedArrival) { this.expectedArrival = expectedArrival; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public Boolean getPreApproved() { return preApproved; }
    public void setPreApproved(Boolean preApproved) { this.preApproved = preApproved; }

    public VisitorApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(VisitorApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }

    public LocalDateTime getEntryTime() { return entryTime; }
    public void setEntryTime(LocalDateTime entryTime) { this.entryTime = entryTime; }

    public LocalDateTime getExitTime() { return exitTime; }
    public void setExitTime(LocalDateTime exitTime) { this.exitTime = exitTime; }

    public Long getHostId() { return hostId; }
    public void setHostId(Long hostId) { this.hostId = hostId; }

    public String getHostName() { return hostName; }
    public void setHostName(String hostName) { this.hostName = hostName; }

    // Builder Implementation
    public static VisitorDtoBuilder builder() {
        return new VisitorDtoBuilder();
    }

    public static class VisitorDtoBuilder {
        private Long id;
        private String name;
        private String phone;
        private Long flatId;
        private String flatDetails;
        private LocalDateTime expectedArrival;
        private String purpose;
        private Boolean preApproved;
        private VisitorApprovalStatus approvalStatus;
        private LocalDateTime entryTime;
        private LocalDateTime exitTime;
        private Long hostId;
        private String hostName;

        public VisitorDtoBuilder id(Long id) { this.id = id; return this; }
        public VisitorDtoBuilder name(String name) { this.name = name; return this; }
        public VisitorDtoBuilder phone(String phone) { this.phone = phone; return this; }
        public VisitorDtoBuilder flatId(Long flatId) { this.flatId = flatId; return this; }
        public VisitorDtoBuilder flatDetails(String flatDetails) { this.flatDetails = flatDetails; return this; }
        public VisitorDtoBuilder expectedArrival(LocalDateTime expectedArrival) { this.expectedArrival = expectedArrival; return this; }
        public VisitorDtoBuilder purpose(String purpose) { this.purpose = purpose; return this; }
        public VisitorDtoBuilder preApproved(Boolean preApproved) { this.preApproved = preApproved; return this; }
        public VisitorDtoBuilder approvalStatus(VisitorApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; return this; }
        public VisitorDtoBuilder entryTime(LocalDateTime entryTime) { this.entryTime = entryTime; return this; }
        public VisitorDtoBuilder exitTime(LocalDateTime exitTime) { this.exitTime = exitTime; return this; }
        public VisitorDtoBuilder hostId(Long hostId) { this.hostId = hostId; return this; }
        public VisitorDtoBuilder hostName(String hostName) { this.hostName = hostName; return this; }

        public VisitorDto build() {
            return new VisitorDto(id, name, phone, flatId, flatDetails, expectedArrival, purpose, preApproved, approvalStatus, entryTime, exitTime, hostId, hostName);
        }
    }
}
