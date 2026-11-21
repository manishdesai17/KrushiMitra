package com.krushimitra.service;

import com.krushimitra.dto.CreateFarmerRequest;
import com.krushimitra.dto.FarmerResponse;
import com.krushimitra.dto.UpdateFarmerRequest;

import java.util.List;

public interface FarmerService {
    List<FarmerResponse> findAll();

    FarmerResponse findById(Long farmerId);

    FarmerResponse create(CreateFarmerRequest request);

    FarmerResponse update(Long farmerId, UpdateFarmerRequest request);

    void delete(Long farmerId);
}