package com.portico.backend.repository;

import com.portico.backend.entity.Complaint;
import com.portico.backend.entity.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByRaisedById(Long raisedById);
    List<Complaint> findByStatus(ComplaintStatus status);
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    long countByStatus(@Param("status") ComplaintStatus status);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countComplaintsByCategory();

    @Query("SELECT AVG(c.resolutionTimeMinutes) FROM Complaint c WHERE c.status = 'RESOLVED' AND c.resolutionTimeMinutes IS NOT NULL")
    Double getAverageResolutionTimeMinutes();
}
