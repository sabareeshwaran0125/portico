package com.portico.backend.service;

import com.portico.backend.dto.BillDto;
import com.portico.backend.entity.*;
import com.portico.backend.repository.BillRepository;
import com.portico.backend.repository.FlatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class BillServiceTest {

    @InjectMocks
    private BillService billService;

    @Mock
    private BillRepository billRepository;

    @Mock
    private FlatRepository flatRepository;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGenerateMonthlyBills_Success() {
        User resident = User.builder().id(1L).email("resident@test.com")
                .firstName("John").lastName("Doe").phone("123").role(Role.RESIDENT).build();

        Flat flat = Flat.builder()
                .id(1L).block("A").flatNumber("101")
                .sizeSqft(1200.0).flatType("2BHK").resident(resident)
                .build();

        when(flatRepository.findAll()).thenReturn(Collections.singletonList(flat));
        when(billRepository.findByFlatId(1L)).thenReturn(Collections.emptyList());
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> {
            Bill saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        List<BillDto> bills = billService.generateMonthlyBills(
                "2026-07", LocalDate.now().plusDays(10), BigDecimal.valueOf(2.5));

        assertNotNull(bills);
        assertEquals(1, bills.size());
        BillDto bill = bills.get(0);
        assertEquals(10L, bill.getId());
        // 1200 sqft * 2.5 rate = 3000.00
        assertEquals(0, BigDecimal.valueOf(3000.00).compareTo(bill.getAmount()));
        assertEquals("2026-07", bill.getBillingMonth());

        verify(billRepository, times(1)).save(any(Bill.class));
    }

    @Test
    public void testGenerateMonthlyBills_NegativeRate_ThrowsBadRequest() {
        assertThrows(Exception.class, () ->
            billService.generateMonthlyBills("2026-07", LocalDate.now(), BigDecimal.valueOf(-1))
        );
    }
}
