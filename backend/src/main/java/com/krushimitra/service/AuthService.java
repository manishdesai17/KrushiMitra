package com.krushimitra.service;

import com.krushimitra.dto.AuthResponse;
import com.krushimitra.dto.CreateFarmerRequest;
import com.krushimitra.dto.LoginRequest;
import com.krushimitra.entity.Farmer;

public interface AuthService {
    AuthResponse register(CreateFarmerRequest request);

    AuthResponse login(LoginRequest request);

    Farmer updateLanguage(Long farmerId, String language);
}