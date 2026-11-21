package com.krushimitra.controller;

import com.krushimitra.dto.AuthResponse;
import com.krushimitra.dto.CreateFarmerRequest;
import com.krushimitra.dto.FarmerResponse;
import com.krushimitra.dto.LoginRequest;
import com.krushimitra.dto.UpdateLanguageRequest;
import com.krushimitra.entity.Farmer;
import com.krushimitra.service.AuthService;
import com.krushimitra.service.FarmerService;
import jakarta.validation.Valid;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final FarmerService farmerService;

    public AuthController(AuthService authService, FarmerService farmerService) {
        this.authService = authService;
        this.farmerService = farmerService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody CreateFarmerRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public FarmerResponse currentFarmer(@AuthenticationPrincipal Jwt jwt) {
        return farmerService.findById(jwt.getClaim("farmerId"));
    }

    @PutMapping("/language")
    public FarmerResponse updateLanguage(@AuthenticationPrincipal Jwt jwt,
                                         @Valid @RequestBody UpdateLanguageRequest request) {
        Farmer farmer = authService.updateLanguage(jwt.getClaim("farmerId"), request.language());
        return farmerService.findById(farmer.getFarmerId());
    }
}