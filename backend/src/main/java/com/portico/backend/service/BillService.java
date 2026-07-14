package com.portico.backend.service;

import com.portico.backend.dto.BillDto;
import com.portico.backend.entity.Bill;
import com.portico.backend.entity.BillStatus;
import com.portico.backend.entity.Flat;
import com.portico.backend.exception.BadRequestException;
import com.portico.backend.exception.ResourceNotFoundException;
import com.portico.backend.repository.BillRepository;
import com.portico.backend.repository.FlatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private FlatRepository flatRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public List<BillDto> generateMonthlyBills(String billingMonth, LocalDate dueDate, BigDecimal ratePerSqFt) {
        if (ratePerSqFt.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Rate per SqFt must be positive");
        }

        List<Flat> occupiedFlats = flatRepository.findAll().stream()
                .filter(f -> f.getResident() != null)
                .collect(Collectors.toList());

        if (occupiedFlats.isEmpty()) {
            throw new BadRequestException("No occupied flats found to bill");
        }

        List<BillDto> generatedBills = new ArrayList<>();

        for (Flat flat : occupiedFlats) {
            // Check if bill already exists for this flat and month
            boolean exists = billRepository.findByFlatId(flat.getId()).stream()
                    .anyMatch(b -> b.getBillingMonth().equals(billingMonth));

            if (exists) {
                continue; // Skip already billed flats for this month to avoid duplicates
            }

            BigDecimal amount = BigDecimal.valueOf(flat.getSizeSqft())
                    .multiply(ratePerSqFt)
                    .setScale(2, RoundingMode.HALF_UP);

            Bill bill = Bill.builder()
                    .flat(flat)
                    .title("Maintenance Charge - " + billingMonth)
                    .amount(amount)
                    .billingMonth(billingMonth)
                    .dueDate(dueDate)
                    .status(BillStatus.PENDING)
                    .build();

            Bill saved = billRepository.save(bill);
            generatedBills.add(mapToDto(saved));

            if (flat.getResident() != null) {
                notificationService.createNotification(flat.getResident(), "New bill generated for " + billingMonth + ": ₹" + amount, "BILL_DUE");
            }
        }

        return generatedBills;
    }

    @Transactional
    public BillDto createCustomBill(BillDto billDto) {
        Flat flat = flatRepository.findById(billDto.getFlatId())
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        Bill bill = Bill.builder()
                .flat(flat)
                .title(billDto.getTitle())
                .amount(billDto.getAmount())
                .billingMonth(billDto.getBillingMonth())
                .dueDate(billDto.getDueDate())
                .status(BillStatus.PENDING)
                .build();

        Bill saved = billRepository.save(bill);
        
        if (flat.getResident() != null) {
            notificationService.createNotification(flat.getResident(), "New custom bill generated: " + billDto.getTitle() + " for ₹" + billDto.getAmount(), "BILL_DUE");
        }
        
        return mapToDto(saved);
    }

    public List<BillDto> getAllBills() {
        // Automatically check/update late statuses when reading bills
        updateOverdueBills();
        return billRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BillDto> getResidentBills(Long residentId) {
        updateOverdueBills();
        return billRepository.findByFlatResidentId(residentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public BillDto getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        return mapToDto(bill);
    }

    // Cron job or manually run: mark pending bills as overdue after due date
    @Transactional
    @Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    public void updateOverdueBills() {
        LocalDate today = LocalDate.now();
        List<Bill> overdueBills = billRepository.findByStatusAndDueDateBefore(BillStatus.PENDING, today);
        for (Bill bill : overdueBills) {
            bill.setStatus(BillStatus.OVERDUE);
            billRepository.save(bill);
        }
    }

    private BillDto mapToDto(Bill bill) {
        return BillDto.builder()
                .id(bill.getId())
                .flatId(bill.getFlat().getId())
                .flatDetails("Block " + bill.getFlat().getBlock() + " - " + bill.getFlat().getFlatNumber())
                .title(bill.getTitle())
                .amount(bill.getAmount())
                .billingMonth(bill.getBillingMonth())
                .dueDate(bill.getDueDate())
                .status(bill.getStatus())
                .build();
    }
}
