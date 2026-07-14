package com.portico.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AnalyticsResponse {
    private long totalResidents;
    private double occupancyRate;
    private BigDecimal maintenanceCollectedThisMonth;
    private BigDecimal maintenancePendingThisMonth;
    private long visitorsToday;
    private long openComplaintsCount;
    private Map<String, Long> complaintsByCategory;
    private List<DefaulterDto> defaulters;
    private List<MonthlyTrendDto> monthlyTrends;
    private List<VisitorTrendDto> visitorTrends;

    public AnalyticsResponse() {}

    public AnalyticsResponse(long totalResidents, double occupancyRate, BigDecimal maintenanceCollectedThisMonth,
            BigDecimal maintenancePendingThisMonth, long visitorsToday, long openComplaintsCount,
            Map<String, Long> complaintsByCategory, List<DefaulterDto> defaulters, List<MonthlyTrendDto> monthlyTrends,
            List<VisitorTrendDto> visitorTrends) {
        this.totalResidents = totalResidents; this.occupancyRate = occupancyRate;
        this.maintenanceCollectedThisMonth = maintenanceCollectedThisMonth;
        this.maintenancePendingThisMonth = maintenancePendingThisMonth;
        this.visitorsToday = visitorsToday; this.openComplaintsCount = openComplaintsCount;
        this.complaintsByCategory = complaintsByCategory; this.defaulters = defaulters;
        this.monthlyTrends = monthlyTrends; this.visitorTrends = visitorTrends;
    }

    public long getTotalResidents() { return totalResidents; } public void setTotalResidents(long v) { this.totalResidents = v; }
    public double getOccupancyRate() { return occupancyRate; } public void setOccupancyRate(double v) { this.occupancyRate = v; }
    public BigDecimal getMaintenanceCollectedThisMonth() { return maintenanceCollectedThisMonth; } public void setMaintenanceCollectedThisMonth(BigDecimal v) { this.maintenanceCollectedThisMonth = v; }
    public BigDecimal getMaintenancePendingThisMonth() { return maintenancePendingThisMonth; } public void setMaintenancePendingThisMonth(BigDecimal v) { this.maintenancePendingThisMonth = v; }
    public long getVisitorsToday() { return visitorsToday; } public void setVisitorsToday(long v) { this.visitorsToday = v; }
    public long getOpenComplaintsCount() { return openComplaintsCount; } public void setOpenComplaintsCount(long v) { this.openComplaintsCount = v; }
    public Map<String, Long> getComplaintsByCategory() { return complaintsByCategory; } public void setComplaintsByCategory(Map<String, Long> v) { this.complaintsByCategory = v; }
    public List<DefaulterDto> getDefaulters() { return defaulters; } public void setDefaulters(List<DefaulterDto> v) { this.defaulters = v; }
    public List<MonthlyTrendDto> getMonthlyTrends() { return monthlyTrends; } public void setMonthlyTrends(List<MonthlyTrendDto> v) { this.monthlyTrends = v; }
    public List<VisitorTrendDto> getVisitorTrends() { return visitorTrends; } public void setVisitorTrends(List<VisitorTrendDto> v) { this.visitorTrends = v; }

    public static AnalyticsResponseBuilder builder() { return new AnalyticsResponseBuilder(); }

    public static class AnalyticsResponseBuilder {
        private long totalResidents; private double occupancyRate;
        private BigDecimal maintenanceCollectedThisMonth; private BigDecimal maintenancePendingThisMonth;
        private long visitorsToday; private long openComplaintsCount;
        private Map<String, Long> complaintsByCategory; private List<DefaulterDto> defaulters; 
        private List<MonthlyTrendDto> monthlyTrends; private List<VisitorTrendDto> visitorTrends;

        public AnalyticsResponseBuilder totalResidents(long v) { this.totalResidents = v; return this; }
        public AnalyticsResponseBuilder occupancyRate(double v) { this.occupancyRate = v; return this; }
        public AnalyticsResponseBuilder maintenanceCollectedThisMonth(BigDecimal v) { this.maintenanceCollectedThisMonth = v; return this; }
        public AnalyticsResponseBuilder maintenancePendingThisMonth(BigDecimal v) { this.maintenancePendingThisMonth = v; return this; }
        public AnalyticsResponseBuilder visitorsToday(long v) { this.visitorsToday = v; return this; }
        public AnalyticsResponseBuilder openComplaintsCount(long v) { this.openComplaintsCount = v; return this; }
        public AnalyticsResponseBuilder complaintsByCategory(Map<String, Long> v) { this.complaintsByCategory = v; return this; }
        public AnalyticsResponseBuilder defaulters(List<DefaulterDto> v) { this.defaulters = v; return this; }
        public AnalyticsResponseBuilder monthlyTrends(List<MonthlyTrendDto> v) { this.monthlyTrends = v; return this; }
        public AnalyticsResponseBuilder visitorTrends(List<VisitorTrendDto> v) { this.visitorTrends = v; return this; }
        public AnalyticsResponse build() { return new AnalyticsResponse(totalResidents, occupancyRate, maintenanceCollectedThisMonth, maintenancePendingThisMonth, visitorsToday, openComplaintsCount, complaintsByCategory, defaulters, monthlyTrends, visitorTrends); }
    }

    // ─── Nested DTOs ────────────────────────────────────────────────────────────

    public static class DefaulterDto {
        private String flatDetails; private String residentName;
        private BigDecimal outstandingAmount; private String billingMonth;

        public DefaulterDto() {}
        public DefaulterDto(String flatDetails, String residentName, BigDecimal outstandingAmount, String billingMonth) {
            this.flatDetails = flatDetails; this.residentName = residentName;
            this.outstandingAmount = outstandingAmount; this.billingMonth = billingMonth;
        }
        public String getFlatDetails() { return flatDetails; } public void setFlatDetails(String v) { this.flatDetails = v; }
        public String getResidentName() { return residentName; } public void setResidentName(String v) { this.residentName = v; }
        public BigDecimal getOutstandingAmount() { return outstandingAmount; } public void setOutstandingAmount(BigDecimal v) { this.outstandingAmount = v; }
        public String getBillingMonth() { return billingMonth; } public void setBillingMonth(String v) { this.billingMonth = v; }

        public static DefaulterDtoBuilder builder() { return new DefaulterDtoBuilder(); }
        public static class DefaulterDtoBuilder {
            private String flatDetails; private String residentName; private BigDecimal outstandingAmount; private String billingMonth;
            public DefaulterDtoBuilder flatDetails(String v) { this.flatDetails = v; return this; }
            public DefaulterDtoBuilder residentName(String v) { this.residentName = v; return this; }
            public DefaulterDtoBuilder outstandingAmount(BigDecimal v) { this.outstandingAmount = v; return this; }
            public DefaulterDtoBuilder billingMonth(String v) { this.billingMonth = v; return this; }
            public DefaulterDto build() { return new DefaulterDto(flatDetails, residentName, outstandingAmount, billingMonth); }
        }
    }

    public static class MonthlyTrendDto {
        private String month; private BigDecimal collected; private BigDecimal pending;

        public MonthlyTrendDto() {}
        public MonthlyTrendDto(String month, BigDecimal collected, BigDecimal pending) {
            this.month = month; this.collected = collected; this.pending = pending;
        }
        public String getMonth() { return month; } public void setMonth(String v) { this.month = v; }
        public BigDecimal getCollected() { return collected; } public void setCollected(BigDecimal v) { this.collected = v; }
        public BigDecimal getPending() { return pending; } public void setPending(BigDecimal v) { this.pending = v; }

        public static MonthlyTrendDtoBuilder builder() { return new MonthlyTrendDtoBuilder(); }
        public static class MonthlyTrendDtoBuilder {
            private String month; private BigDecimal collected; private BigDecimal pending;
            public MonthlyTrendDtoBuilder month(String v) { this.month = v; return this; }
            public MonthlyTrendDtoBuilder collected(BigDecimal v) { this.collected = v; return this; }
            public MonthlyTrendDtoBuilder pending(BigDecimal v) { this.pending = v; return this; }
            public MonthlyTrendDto build() { return new MonthlyTrendDto(month, collected, pending); }
        }
    }

    public static class VisitorTrendDto {
        private String date; private long count;
        public VisitorTrendDto() {}
        public VisitorTrendDto(String date, long count) { this.date = date; this.count = count; }
        public String getDate() { return date; } public void setDate(String v) { this.date = v; }
        public long getCount() { return count; } public void setCount(long v) { this.count = v; }
    }
}
