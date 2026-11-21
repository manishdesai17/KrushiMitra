package com.krushimitra.service.impl;

import com.krushimitra.dto.AuthResponse;
import com.krushimitra.dto.CreateFarmerRequest;
import com.krushimitra.dto.FarmerResponse;
import com.krushimitra.dto.LoginRequest;
import com.krushimitra.entity.Farmer;
import com.krushimitra.entity.User;
import com.krushimitra.exception.ResourceNotFoundException;
import com.krushimitra.repository.FarmerRepository;
import com.krushimitra.repository.UserRepository;
import com.krushimitra.service.AuthService;
import com.krushimitra.service.FarmerService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final FarmerService farmerService;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public AuthServiceImpl(UserRepository userRepository, FarmerRepository farmerRepository,
                           FarmerService farmerService, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder) {
        this.userRepository = userRepository;
        this.farmerRepository = farmerRepository;
        this.farmerService = farmerService;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    @Override
    public AuthResponse register(CreateFarmerRequest request) {
        FarmerResponse farmer = farmerService.create(request);
        return issueToken(farmer.farmerId(), farmer.fullName(), farmer.mobileNumber(), farmer.preferredLanguage(), "FARMER");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.mobileNumber())
                .orElseThrow(() -> new BadCredentialsException("Invalid mobile number or password."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid mobile number or password.");
        }

        Farmer farmer = farmerRepository.findByMobileNumber(request.mobileNumber())
                .orElseThrow(() -> new BadCredentialsException("Invalid mobile number or password."));
        if (request.language() != null && !request.language().isBlank()) {
            farmer.updatePreferredLanguage(request.language());
        }
        return issueToken(farmer.getFarmerId(), farmer.getFullName(), farmer.getMobileNumber(),
                farmer.getPreferredLanguage(), user.getRole());
    }

    @Override
    public Farmer updateLanguage(Long farmerId, String language) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer " + farmerId + " was not found."));
        farmer.updatePreferredLanguage(language);
        return farmer;
    }

    private AuthResponse issueToken(Long farmerId, String fullName, String mobileNumber,
                                    String language, String role) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("krushimitra")
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofHours(12)))
                .subject(mobileNumber)
                .claim("farmerId", farmerId)
                .claim("role", role)
                .claim("language", language)
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthResponse(token, "Bearer", farmerId, fullName, mobileNumber, language);
    }
}