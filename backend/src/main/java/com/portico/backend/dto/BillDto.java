package com.portico.backend.dto;

import com.portico.backend.entity.BillStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BillDto {
    private Long id;

    @NotNull(message = "Flat ID is required")
    private Long flatId;

    private String flatDetails; // e.g. "Block A - 101"

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotBlank(message = "Billing month is required")
    private String billingMonth; // "YYYY-MM"

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private BillStatus status;

    // Constructors
    public BillDto() {
    }

    public BillDto(Long id, Long flatId, String flatDetails, String title, BigDecimal amount, String billingMonth, LocalDate dueDate, BillStatus status) {
        this.id = id;
        this.flatId = flatId;
        this.flatDetails = flatDetails;
        this.title = title;
        this.amount = amount;
        this.billingMonth = billingMonth;
        this.dueDate = dueDate;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFlatId() { return flatId; }
    public void setFlatId(Long flatId) { this.flatId = flatId; }

    public String getFlatDetails() { return flatDetails; }
    public void setFlatDetails(String flatDetails) { this.flatDetails = flatDetails; }

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

    // Builder Implementation
    public static BillDtoBuilder builder() {
        return new BillDtoBuilder();
    }

    public static class BillDtoBuilder {
        private Long id;
        private Long flatId;
        private String flatDetails;
        private String title;
        private BigDecimal amount;
        private String billingMonth;
        private LocalDate dueDate;
        private BillStatus status;

        public BillDtoBuilder id(Long id) { this.id = id; return this; }
        public BillDtoBuilder flatId(Long flatId) { this.flatId = flatId; return this; }
        public BillDtoBuilder flatDetails(String flatDetails) { this.flatDetails = flatDetails; return this; }
        public BillDtoBuilder title(String title) { this.title = title; return this; }
        public BillDtoBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public BillDtoBuilder billingMonth(String billingMonth) { this.billingMonth = billingMonth; return this; }
        public BillDtoBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public BillDtoBuilder status(BillStatus status) { this.status = status; return this; }

        public BillDto build() {
            return new BillDto(id, flatId, flatDetails, title, amount, billingMonth, dueDate, status);
        }
    }
}
