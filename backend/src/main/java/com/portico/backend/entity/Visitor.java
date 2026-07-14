package com.portico.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "visitors")
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flat_id", nullable = false)
    private Flat flat;

    @Column(name = "expected_arrival", nullable = false)
    private LocalDateTime expectedArrival;

    @Column(nullable = false)
    private String purpose;

    @Column(name = "pre_approved", nullable = false)
    private Boolean preApproved;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private VisitorApprovalStatus approvalStatus;

    @Column(name = "entry_time")
    private LocalDateTime entryTime;

    @Column(name = "exit_time")
    private LocalDateTime exitTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "host_id")
    private User host;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Visitor() {
    }

    public Visitor(Long id, String name, String phone, Flat flat, LocalDateTime expectedArrival, String purpose, Boolean preApproved, VisitorApprovalStatus approvalStatus, LocalDateTime entryTime, LocalDateTime exitTime, User host, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.flat = flat;
        this.expectedArrival = expectedArrival;
        this.purpose = purpose;
        this.preApproved = preApproved;
        this.approvalStatus = approvalStatus;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
        this.host = host;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Flat getFlat() { return flat; }
    public void setFlat(Flat flat) { this.flat = flat; }

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

    public User getHost() { return host; }
    public void setHost(User host) { this.host = host; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder Implementation
    public static VisitorBuilder builder() {
        return new VisitorBuilder();
    }

    public static class VisitorBuilder {
        private Long id;
        private String name;
        private String phone;
        private Flat flat;
        private LocalDateTime expectedArrival;
        private String purpose;
        private Boolean preApproved;
        private VisitorApprovalStatus approvalStatus;
        private LocalDateTime entryTime;
        private LocalDateTime exitTime;
        private User host;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public VisitorBuilder id(Long id) { this.id = id; return this; }
        public VisitorBuilder name(String name) { this.name = name; return this; }
        public VisitorBuilder phone(String phone) { this.phone = phone; return this; }
        public VisitorBuilder flat(Flat flat) { this.flat = flat; return this; }
        public VisitorBuilder expectedArrival(LocalDateTime expectedArrival) { this.expectedArrival = expectedArrival; return this; }
        public VisitorBuilder purpose(String purpose) { this.purpose = purpose; return this; }
        public VisitorBuilder preApproved(Boolean preApproved) { this.preApproved = preApproved; return this; }
        public VisitorBuilder approvalStatus(VisitorApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; return this; }
        public VisitorBuilder entryTime(LocalDateTime entryTime) { this.entryTime = entryTime; return this; }
        public VisitorBuilder exitTime(LocalDateTime exitTime) { this.exitTime = exitTime; return this; }
        public VisitorBuilder host(User host) { this.host = host; return this; }
        public VisitorBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public VisitorBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Visitor build() {
            return new Visitor(id, name, phone, flat, expectedArrival, purpose, preApproved, approvalStatus, entryTime, exitTime, host, createdAt, updatedAt);
        }
    }
}
