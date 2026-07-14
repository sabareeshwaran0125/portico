package com.portico.backend.repository;

import com.portico.backend.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    @Query("SELECT n FROM Notice n WHERE n.expiryDate >= :date ORDER BY n.createdAt DESC")
    List<Notice> findActiveNotices(@Param("date") LocalDate date);
}
