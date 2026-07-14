package com.portico.backend.repository;

import com.portico.backend.entity.Bill;
import com.portico.backend.entity.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByFlatResidentId(Long residentId);
    List<Bill> findByFlatId(Long flatId);
    List<Bill> findByStatus(BillStatus status);
    
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Bill b WHERE b.billingMonth = :month AND b.status = :status")
    BigDecimal sumAmountByBillingMonthAndStatus(@Param("month") String month, @Param("status") BillStatus status);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Bill b WHERE b.billingMonth = :month")
    BigDecimal sumAmountByBillingMonth(@Param("month") String month);

    List<Bill> findByStatusAndDueDateBefore(BillStatus status, LocalDate date);
}
