package com.portico.backend.repository;

import com.portico.backend.entity.Payment;
import com.portico.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String orderId);
    Optional<Payment> findByBillIdAndStatus(Long billId, PaymentStatus status);
}
