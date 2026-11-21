package com.krushimitra.service.impl;

import com.krushimitra.dto.CreateFarmerRequest;
import com.krushimitra.dto.FarmerResponse;
import com.krushimitra.dto.UpdateFarmerRequest;
import com.krushimitra.entity.Farmer;
import com.krushimitra.entity.User;
import com.krushimitra.exception.DuplicateResourceException;
import com.krushimitra.exception.ResourceNotFoundException;
import com.krushimitra.repository.FarmerRepository;
import com.krushimitra.service.FarmerService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FarmerServiceImpl implements FarmerService {

    private final FarmerRepository farmerRepository;
    private final PasswordEncoder passwordEncoder;

    public FarmerServiceImpl(FarmerRepository farmerRepository, PasswordEncoder passwordEncoder) {
        this.farmerRepository = farmerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FarmerResponse> findAll() {
        return farmerRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FarmerResponse findById(Long farmerId) {
        return toResponse(findFarmer(farmerId));
    }

    @Override
    public FarmerResponse create(CreateFarmerRequest request) {
        if (farmerRepository.existsByMobileNumber(request.mobileNumber())) {
            throw new DuplicateResourceException("This mobile number is already registered.");
        }

        User user = new User(request.mobileNumber(), passwordEncoder.encode(request.password()), "FARMER");
        Farmer farmer = new Farmer(user, request.fullName(), request.mobileNumber(), request.email(),
            request.village(), request.taluka(), request.district(), request.state(),
            request.language() == null || request.language().isBlank() ? "gu" : request.language());
        return toResponse(farmerRepository.save(farmer));
    }

    @Override
    public FarmerResponse update(Long farmerId, UpdateFarmerRequest request) {
        Farmer farmer = findFarmer(farmerId);
        if (farmerRepository.existsByMobileNumberAndFarmerIdNot(request.mobileNumber(), farmerId)) {
            throw new DuplicateResourceException("This mobile number is already registered.");
        }

        farmer.updateProfile(request.fullName(), request.mobileNumber(), request.email(),
                request.village(), request.taluka(), request.district(), request.state());
        return toResponse(farmerRepository.save(farmer));
    }

    @Override
    public void delete(Long farmerId) {
        farmerRepository.delete(findFarmer(farmerId));
    }

    private Farmer findFarmer(Long farmerId) {
        return farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer " + farmerId + " was not found."));
    }

    private FarmerResponse toResponse(Farmer farmer) {
        return new FarmerResponse(farmer.getFarmerId(), farmer.getFullName(), farmer.getMobileNumber(),
                farmer.getEmail(), farmer.getVillage(), farmer.getTaluka(), farmer.getDistrict(),
                farmer.getState(), farmer.getPreferredLanguage(), farmer.getCreatedAt(), farmer.getUpdatedAt());
    }
}