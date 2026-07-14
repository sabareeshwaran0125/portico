package com.portico.backend.controller;

import com.portico.backend.dto.BillDto;
import com.portico.backend.dto.FlatDto;
import com.portico.backend.dto.RazorpayCallbackDto;
import com.portico.backend.dto.RazorpayOrderDto;
import com.portico.backend.dto.VisitorDto;
import com.portico.backend.entity.Payment;
import com.portico.backend.entity.VisitorApprovalStatus;
import com.portico.backend.exception.BadRequestException;
import com.portico.backend.exception.ResourceNotFoundException;
import com.portico.backend.security.UserPrincipal;
import com.portico.backend.service.BillService;
import com.portico.backend.service.FlatService;
import com.portico.backend.service.PaymentService;
import com.portico.backend.service.PdfService;
import com.portico.backend.service.VisitorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resident")
@PreAuthorize("hasRole('RESIDENT')")
public class ResidentController {

    @Autowired
    private FlatService flatService;

    @Autowired
    private BillService billService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private VisitorService visitorService;

    // --- Flat Lookup ---
    @GetMapping("/flats")
    public ResponseEntity<List<FlatDto>> getMyFlats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(flatService.getFlatsByResident(principal.getId()));
    }

    // --- Billing & Receipts ---
    @GetMapping("/bills")
    public ResponseEntity<List<BillDto>> getMyBills(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(billService.getResidentBills(principal.getId()));
    }

    @PostMapping("/payments/initiate/{billId}")
    public ResponseEntity<RazorpayOrderDto> initiatePayment(@PathVariable Long billId) {
        return ResponseEntity.ok(paymentService.initiatePayment(billId));
    }

    @PostMapping("/payments/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(@Valid @RequestBody RazorpayCallbackDto callbackDto) {
        boolean verified = paymentService.verifyPayment(callbackDto);
        if (verified) {
            return ResponseEntity.ok(Map.of("message", "Payment successfully processed and verified"));
        } else {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of("error", "Payment verification failed"));
        }
    }

    @GetMapping("/payments/receipt/{billId}")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long billId, @AuthenticationPrincipal UserPrincipal principal) {
        Payment payment = paymentService.getSuccessfulPaymentForBill(billId)
                .orElseThrow(() -> new ResourceNotFoundException("No successful transaction receipt found for this bill"));

        if (!payment.getBill().getFlat().getResident().getId().equals(principal.getId())) {
            throw new BadRequestException("You are not authorized to download this receipt");
        }

        byte[] pdfBytes = pdfService.generateMaintenanceReceipt(payment.getBill(), payment);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=receipt_bill_" + billId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    // --- Visitor Approvals ---
    @PostMapping("/visitors/pre-approve")
    public ResponseEntity<VisitorDto> preApproveVisitor(@Valid @RequestBody VisitorDto visitorDto, @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(visitorService.preApproveVisitor(visitorDto, principal.getId()), HttpStatus.CREATED);
    }

    @PutMapping("/visitors/{id}/approval")
    public ResponseEntity<VisitorDto> updateVisitorApproval(@PathVariable Long id,
                                                            @RequestParam VisitorApprovalStatus status,
                                                            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(visitorService.updateApprovalStatus(id, status, principal.getId()));
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<VisitorDto>> getMyVisitorHistory(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(visitorService.getVisitorHistoryByHost(principal.getId()));
    }
}
