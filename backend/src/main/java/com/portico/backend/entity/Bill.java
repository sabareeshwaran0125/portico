package com.portico.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flat_id", nullable = false)
    private Flat flat;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "billing_month", nullable = false)
    private String billingMonth; // format: "YYYY-MM"

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Bill() {
    }

    public Bill(Long id, Flat flat, String title, BigDecimal amount, String billingMonth, LocalDate dueDate, BillStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.flat = flat;
        this.title = title;
        this.amount = amount;
        this.billingMonth = billingMonth;
        this.dueDate = dueDate;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Flat getFlat() { return flat; }
    public void setFlat(Flat flat) { this.flat = flat; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getBillingMonth() { return billingMonth; }
    public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public BillStatus getStatus() { return status; }
    public void setStatus(BillStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder Implementation
    public static BillBuilder builder() {
        return new BillBuilder();
    }

    public static class BillBuilder {
        private Long id;
        private Flat flat;
        private String title;
        private BigDecimal amount;
        private String billingMonth;
        private LocalDate dueDate;
        private BillStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public BillBuilder id(Long id) { this.id = id; return this; }
        public BillBuilder flat(Flat flat) { this.flat = flat; return this; }
        public BillBuilder title(String title) { this.title = title; return this; }
        public BillBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public BillBuilder billingMonth(String billingMonth) { this.billingMonth = billingMonth; return this; }
        public BillBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public BillBuilder status(BillStatus status) { this.status = status; return this; }
        public BillBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public BillBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Bill build() {
            return new Bill(id, flat, title, amount, billingMonth, dueDate, status, createdAt, updatedAt);
        }
    }
}
