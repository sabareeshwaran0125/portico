package com.portico.backend.dto;

import java.math.BigDecimal;

public class RazorpayOrderDto {
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String keyId;
    private Long billId;

    public RazorpayOrderDto() {}

    public RazorpayOrderDto(String orderId, BigDecimal amount, String currency, String keyId, Long billId) {
        this.orderId = orderId; this.amount = amount; this.currency = currency;
        this.keyId = keyId; this.billId = billId;
    }

    public String getOrderId() { return orderId; } public void setOrderId(String v) { this.orderId = v; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal v) { this.amount = v; }
    public String getCurrency() { return currency; } public void setCurrency(String v) { this.currency = v; }
    public String getKeyId() { return keyId; } public void setKeyId(String v) { this.keyId = v; }
    public Long getBillId() { return billId; } public void setBillId(Long v) { this.billId = v; }

    public static RazorpayOrderDtoBuilder builder() { return new RazorpayOrderDtoBuilder(); }

    public static class RazorpayOrderDtoBuilder {
        private String orderId; private BigDecimal amount; private String currency; private String keyId; private Long billId;
        public RazorpayOrderDtoBuilder orderId(String v) { this.orderId = v; return this; }
        public RazorpayOrderDtoBuilder amount(BigDecimal v) { this.amount = v; return this; }
        public RazorpayOrderDtoBuilder currency(String v) { this.currency = v; return this; }
        public RazorpayOrderDtoBuilder keyId(String v) { this.keyId = v; return this; }
        public RazorpayOrderDtoBuilder billId(Long v) { this.billId = v; return this; }
        public RazorpayOrderDto build() { return new RazorpayOrderDto(orderId, amount, currency, keyId, billId); }
    }
}
