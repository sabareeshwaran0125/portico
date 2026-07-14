package com.portico.backend.service;

import com.portico.backend.dto.AnalyticsResponse;
import com.portico.backend.entity.Bill;
import com.portico.backend.entity.BillStatus;
import com.portico.backend.entity.ComplaintStatus;
import com.portico.backend.entity.Role;
import com.portico.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlatRepository flatRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private VisitorRepository visitorRepository;

    public AnalyticsResponse getDashboardAnalytics() {
        // 1. Total residents count
        long totalResidents = userRepository.findByRole(Role.RESIDENT).size();

        // 2. Occupancy rate calculation
        long totalFlats = flatRepository.count();
        long occupiedFlats = flatRepository.countByResidentIsNotNull();
        double occupancyRate = totalFlats > 0 ? ((double) occupiedFlats / totalFlats) * 100 : 0.0;

        // 3. Maintenance collection this month
        String currentMonth = LocalDate.now().getYear() + "-" + String.format("%02d", LocalDate.now().getMonthValue());
        BigDecimal collectedThisMonth = billRepository.sumAmountByBillingMonthAndStatus(currentMonth, BillStatus.PAID);
        BigDecimal pendingThisMonth = billRepository.sumAmountByBillingMonthAndStatus(currentMonth, BillStatus.PENDING)
                .add(billRepository.sumAmountByBillingMonthAndStatus(currentMonth, BillStatus.OVERDUE));

        // 4. Visitors today
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long visitorsToday = visitorRepository.countVisitorsEnteredBetween(startOfDay, endOfDay);

        // 5. Open complaints count
        long openComplaints = complaintRepository.countByStatus(ComplaintStatus.OPEN) +
                complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);

        // 6. Complaints by Category
        List<Object[]> categoryCounts = complaintRepository.countComplaintsByCategory();
        Map<String, Long> complaintsByCategory = new HashMap<>();
        for (Object[] row : categoryCounts) {
            String category = row[0].toString();
            Long count = (Long) row[1];
            complaintsByCategory.put(category, count);
        }

        // 7. Defaulters List
        List<Bill> unpaidBills = billRepository.findByStatus(BillStatus.OVERDUE);
        List<AnalyticsResponse.DefaulterDto> defaulters = unpaidBills.stream()
                .map(bill -> AnalyticsResponse.DefaulterDto.builder()
                        .flatDetails("Block " + bill.getFlat().getBlock() + " - " + bill.getFlat().getFlatNumber())
                        .residentName(bill.getFlat().getResident() != null ?
                                bill.getFlat().getResident().getFirstName() + " " + bill.getFlat().getResident().getLastName() : "Unassigned")
                        .outstandingAmount(bill.getAmount())
                        .billingMonth(bill.getBillingMonth())
                        .build())
                .collect(Collectors.toList());

        // 8. Monthly Collection & Pending Trends (Last 6 Months)
        List<Bill> allBills = billRepository.findAll();
        Map<String, List<Bill>> billsByMonth = allBills.stream()
                .collect(Collectors.groupingBy(Bill::getBillingMonth));

        List<AnalyticsResponse.MonthlyTrendDto> monthlyTrends = new ArrayList<>();
        // Get last 6 months sorted keys
        List<String> sortedMonths = billsByMonth.keySet().stream()
                .sorted()
                .collect(Collectors.toList());
        // Limit to last 6 months
        if (sortedMonths.size() > 6) {
            sortedMonths = sortedMonths.subList(sortedMonths.size() - 6, sortedMonths.size());
        }

        for (String month : sortedMonths) {
            List<Bill> monthBills = billsByMonth.get(month);
            BigDecimal collected = monthBills.stream()
                    .filter(b -> b.getStatus() == BillStatus.PAID)
                    .map(Bill::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal pending = monthBills.stream()
                    .filter(b -> b.getStatus() != BillStatus.PAID)
                    .map(Bill::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            monthlyTrends.add(AnalyticsResponse.MonthlyTrendDto.builder()
                    .month(month)
                    .collected(collected)
                    .pending(pending)
                    .build());
        }
        // 9. Visitor Trends (Last 7 Days)
        List<AnalyticsResponse.VisitorTrendDto> visitorTrends = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);
            long count = visitorRepository.countVisitorsEnteredBetween(start, end);
            visitorTrends.add(new AnalyticsResponse.VisitorTrendDto(date.toString(), count));
        }

        return AnalyticsResponse.builder()
                .totalResidents(totalResidents)
                .occupancyRate(occupancyRate)
                .maintenanceCollectedThisMonth(collectedThisMonth)
                .maintenancePendingThisMonth(pendingThisMonth)
                .visitorsToday(visitorsToday)
                .openComplaintsCount(openComplaints)
                .complaintsByCategory(complaintsByCategory)
                .defaulters(defaulters)
                .monthlyTrends(monthlyTrends)
                .visitorTrends(visitorTrends)
                .build();
    }
}
