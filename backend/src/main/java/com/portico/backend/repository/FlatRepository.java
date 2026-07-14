package com.portico.backend.repository;

import com.portico.backend.entity.Flat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlatRepository extends JpaRepository<Flat, Long> {
    Optional<Flat> findByBlockAndFlatNumber(String block, String flatNumber);
    List<Flat> findByResidentId(Long residentId);
    List<Flat> findByResidentIsNull();
    long countByResidentIsNotNull();
}
