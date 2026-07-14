package com.portico.backend.config;

import com.portico.backend.entity.*;
import com.portico.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlatRepository flatRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private VisitorRepository visitorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Initializing Database with seed data for Portico...");

            // 1. Create Default Users
            User admin = User.builder()
                    .email("admin@portico.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Society")
                    .lastName("Manager")
                    .phone("9876543210")
                    .role(Role.ADMIN)
                    .isApproved(true)
                    .build();
            userRepository.save(admin);

            User resident = User.builder()
                    .email("resident@portico.com")
                    .password(passwordEncoder.encode("resident123"))
                    .firstName("John")
                    .lastName("Doe")
                    .phone("8765432109")
                    .role(Role.RESIDENT)
                    .isApproved(true)
                    .build();
            userRepository.save(resident);

            User guard = User.builder()
                    .email("guard@portico.com")
                    .password(passwordEncoder.encode("guard123"))
                    .firstName("Security")
                    .lastName("Guard")
                    .phone("7654321098")
                    .role(Role.GUARD)
                    .isApproved(true)
                    .build();
            userRepository.save(guard);

            // 2. Create Sample Flats
            String[] blocks = {"A", "B", "C", "D"};
            Flat flat1 = null;

            for (String block : blocks) {
                for (int i = 1; i <= 30; i++) {
                    String flatNum = String.format("%03d", 100 + i);
                    User assignedResident = (block.equals("A") && flatNum.equals("101")) ? resident : null;
                    
                    Flat flat = Flat.builder()
                            .block(block)
                            .flatNumber(flatNum)
                            .sizeSqft(1200.0)
                            .flatType("2BHK")
                            .resident(assignedResident)
                            .build();
                            
                    flat = flatRepository.save(flat);
                    
                    if (assignedResident != null) {
                        flat1 = flat;
                    }
                }
            }

            // 3. Create Sample Bills for Flat A-101
            LocalDate today = LocalDate.now();
            
            // Paid Bill (Previous Month)
            Bill billPaid = Bill.builder()
                    .flat(flat1)
                    .title("Maintenance Charge - June 2026")
                    .amount(BigDecimal.valueOf(3000.00))
                    .billingMonth("2026-06")
                    .dueDate(today.minusMonths(1).withDayOfMonth(15))
                    .status(BillStatus.PAID)
                    .build();
            billRepository.save(billPaid);

            // Pending Bill (Current Month)
            Bill billPending = Bill.builder()
                    .flat(flat1)
                    .title("Maintenance Charge - July 2026")
                    .amount(BigDecimal.valueOf(3000.00))
                    .billingMonth("2026-07")
                    .dueDate(today.withDayOfMonth(25))
                    .status(BillStatus.PENDING)
                    .build();
            billRepository.save(billPending);

            // Overdue Bill (Two months ago, unpaid)
            Bill billOverdue = Bill.builder()
                    .flat(flat1)
                    .title("Maintenance Charge - May 2026")
                    .amount(BigDecimal.valueOf(3000.00))
                    .billingMonth("2026-05")
                    .dueDate(today.minusMonths(2).withDayOfMonth(15))
                    .status(BillStatus.OVERDUE)
                    .build();
            billRepository.save(billOverdue);

            // 4. Create Sample Notices
            Notice notice1 = Notice.builder()
                    .title("Annual General Meeting (AGM) Notice")
                    .content("Dear Residents, the Annual General Meeting is scheduled for Sunday, July 26th at 10:00 AM in the clubhouse. Attendance is mandatory.")
                    .expiryDate(LocalDate.now().plusDays(15))
                    .createdBy(admin)
                    .build();
            noticeRepository.save(notice1);

            Notice notice2 = Notice.builder()
                    .title("Pool Maintenance Operations")
                    .content("Please note that the swimming pool will be closed for quarterly chemical treatment from July 15th to July 17th. Thank you for cooperation.")
                    .expiryDate(LocalDate.now().plusDays(4))
                    .createdBy(admin)
                    .build();
            noticeRepository.save(notice2);

            // 5. Create Sample Complaints
            Complaint complaint1 = Complaint.builder()
                    .title("Water Leakage in Kitchen Sink")
                    .description("The main pipeline under the sink has a slow water leakage causing pool of water on the floor.")
                    .category(ComplaintCategory.PLUMBING)
                    .status(ComplaintStatus.OPEN)
                    .raisedBy(resident)
                    .build();
            complaintRepository.save(complaint1);

            Complaint complaint2 = Complaint.builder()
                    .title("Corridor Light Blinking")
                    .description("The tube light outside flat 101 has been flickering constantly since last night.")
                    .category(ComplaintCategory.ELECTRICAL)
                    .status(ComplaintStatus.RESOLVED)
                    .raisedBy(resident)
                    .resolutionTimeMinutes(120)
                    .build();
            complaintRepository.save(complaint2);

            // 6. Create Expected Visitors for Today
            Visitor visitor1 = Visitor.builder()
                    .name("Alice Smith")
                    .phone("9988776655")
                    .flat(flat1)
                    .expectedArrival(LocalDateTime.now().plusHours(2))
                    .purpose("Social Visit")
                    .preApproved(true)
                    .approvalStatus(VisitorApprovalStatus.APPROVED)
                    .host(resident)
                    .build();
            visitorRepository.save(visitor1);

            Visitor visitor2 = Visitor.builder()
                    .name("Bob Johnson")
                    .phone("8877665544")
                    .flat(flat1)
                    .expectedArrival(LocalDateTime.now().plusHours(4))
                    .purpose("Delivery")
                    .preApproved(true)
                    .approvalStatus(VisitorApprovalStatus.APPROVED)
                    .host(resident)
                    .build();
            visitorRepository.save(visitor2);

            System.out.println("Portico seed data initialization completed!");
        }
    }
}
