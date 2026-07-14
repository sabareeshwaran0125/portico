package com.portico.backend.service;

import com.portico.backend.dto.FlatDto;
import com.portico.backend.entity.Flat;
import com.portico.backend.entity.User;
import com.portico.backend.exception.BadRequestException;
import com.portico.backend.exception.ResourceNotFoundException;
import com.portico.backend.repository.FlatRepository;
import com.portico.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlatService {

    @Autowired
    private FlatRepository flatRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public FlatDto createFlat(FlatDto flatDto) {
        flatRepository.findByBlockAndFlatNumber(flatDto.getBlock(), flatDto.getFlatNumber())
                .ifPresent(f -> {
                    throw new BadRequestException("Flat already exists in this block");
                });

        Flat flat = Flat.builder()
                .block(flatDto.getBlock())
                .flatNumber(flatDto.getFlatNumber())
                .sizeSqft(flatDto.getSizeSqft())
                .flatType(flatDto.getFlatType())
                .build();

        if (flatDto.getResidentId() != null) {
            User resident = userRepository.findById(flatDto.getResidentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resident not found"));
            flat.setResident(resident);
        }

        Flat savedFlat = flatRepository.save(flat);
        return mapToDto(savedFlat);
    }

    public List<FlatDto> getAllFlats() {
        return flatRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FlatDto getFlatById(Long id) {
        Flat flat = flatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));
        return mapToDto(flat);
    }

    public List<FlatDto> getUnoccupiedFlats() {
        return flatRepository.findByResidentIsNull().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FlatDto updateFlat(Long id, FlatDto flatDto) {
        Flat flat = flatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        flat.setBlock(flatDto.getBlock());
        flat.setFlatNumber(flatDto.getFlatNumber());
        flat.setSizeSqft(flatDto.getSizeSqft());
        flat.setFlatType(flatDto.getFlatType());

        if (flatDto.getResidentId() != null) {
            User resident = userRepository.findById(flatDto.getResidentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resident not found"));
            flat.setResident(resident);
        } else {
            flat.setResident(null);
        }

        Flat updatedFlat = flatRepository.save(flat);
        return mapToDto(updatedFlat);
    }

    @Transactional
    public FlatDto assignResident(Long flatId, Long residentId) {
        Flat flat = flatRepository.findById(flatId)
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        if (residentId != null) {
            User resident = userRepository.findById(residentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resident not found"));
            flat.setResident(resident);
        } else {
            flat.setResident(null);
        }

        Flat updatedFlat = flatRepository.save(flat);
        return mapToDto(updatedFlat);
    }

    public List<FlatDto> getFlatsByResident(Long residentId) {
        return flatRepository.findByResidentId(residentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFlat(Long id) {
        if (!flatRepository.existsById(id)) {
            throw new ResourceNotFoundException("Flat not found");
        }
        flatRepository.deleteById(id);
    }

    private FlatDto mapToDto(Flat flat) {
        return FlatDto.builder()
                .id(flat.getId())
                .block(flat.getBlock())
                .flatNumber(flat.getFlatNumber())
                .sizeSqft(flat.getSizeSqft())
                .flatType(flat.getFlatType())
                .residentId(flat.getResident() != null ? flat.getResident().getId() : null)
                .residentName(flat.getResident() != null ? flat.getResident().getFirstName() + " " + flat.getResident().getLastName() : null)
                .residentEmail(flat.getResident() != null ? flat.getResident().getEmail() : null)
                .build();
    }
}
