package com.portico.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RazorpayCallbackDto {
    @NotNull(message = "Bill ID is required")
    private Long billId;

    @NotBlank(message = "Razorpay Order ID is required")
    private String razorpayOrderId;

    private String razorpayPaymentId;
    private String razorpaySignature;

    public RazorpayCallbackDto() {}

    public RazorpayCallbackDto(Long billId, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        this.billId = billId; this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId; this.razorpaySignature = razorpaySignature;
    }

    public Long getBillId() { return billId; } public void setBillId(Long v) { this.billId = v; }
    public String getRazorpayOrderId() { return razorpayOrderId; } public void setRazorpayOrderId(String v) { this.razorpayOrderId = v; }
    public String getRazorpayPaymentId() { return razorpayPaymentId; } public void setRazorpayPaymentId(String v) { this.razorpayPaymentId = v; }
    public String getRazorpaySignature() { return razorpaySignature; } public void setRazorpaySignature(String v) { this.razorpaySignature = v; }
}
