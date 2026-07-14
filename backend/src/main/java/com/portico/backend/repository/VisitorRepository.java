package com.portico.backend.repository;

import com.portico.backend.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    List<Visitor> findByHostId(Long hostId);
    
    @Query("SELECT v FROM Visitor v WHERE v.expectedArrival BETWEEN :start AND :end")
    List<Visitor> findExpectedVisitorsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(v) FROM Visitor v WHERE v.entryTime BETWEEN :start AND :end")
    long countVisitorsEnteredBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
