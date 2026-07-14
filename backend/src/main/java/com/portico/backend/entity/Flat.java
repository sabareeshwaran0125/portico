package com.portico.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "flats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"block", "flat_number"})
})
public class Flat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String block;

    @Column(name = "flat_number", nullable = false)
    private String flatNumber;

    @Column(name = "size_sqft", nullable = false)
    private Double sizeSqft;

    @Column(name = "flat_type", nullable = false)
    private String flatType; // "1BHK", "2BHK", "3BHK"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resident_id")
    private User resident;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Flat() {
    }

    public Flat(Long id, String block, String flatNumber, Double sizeSqft, String flatType, User resident, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.block = block;
        this.flatNumber = flatNumber;
        this.sizeSqft = sizeSqft;
        this.flatType = flatType;
        this.resident = resident;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public User getResident() { return resident; }
    public void setResident(User resident) { this.resident = resident; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder Implementation
    public static FlatBuilder builder() {
        return new FlatBuilder();
    }

    public static class FlatBuilder {
        private Long id;
        private String block;
        private String flatNumber;
        private Double sizeSqft;
        private String flatType;
        private User resident;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public FlatBuilder id(Long id) { this.id = id; return this; }
        public FlatBuilder block(String block) { this.block = block; return this; }
        public FlatBuilder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
        public FlatBuilder sizeSqft(Double sizeSqft) { this.sizeSqft = sizeSqft; return this; }
        public FlatBuilder flatType(String flatType) { this.flatType = flatType; return this; }
        public FlatBuilder resident(User resident) { this.resident = resident; return this; }
        public FlatBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public FlatBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Flat build() {
            return new Flat(id, block, flatNumber, sizeSqft, flatType, resident, createdAt, updatedAt);
        }
    }
}
