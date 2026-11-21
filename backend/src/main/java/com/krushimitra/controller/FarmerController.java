package com.krushimitra.controller;

import com.krushimitra.dto.CreateFarmerRequest;
import com.krushimitra.dto.FarmerResponse;
import com.krushimitra.dto.UpdateFarmerRequest;
import com.krushimitra.service.FarmerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/farmers")
public class FarmerController {

    private final FarmerService farmerService;

    public FarmerController(FarmerService farmerService) {
        this.farmerService = farmerService;
    }

    @GetMapping
    public List<FarmerResponse> findAll() {
        return farmerService.findAll();
    }

    @GetMapping("/{farmerId}")
    public FarmerResponse findById(@PathVariable Long farmerId) {
        return farmerService.findById(farmerId);
    }

    @PostMapping
    public ResponseEntity<FarmerResponse> create(@Valid @RequestBody CreateFarmerRequest request) {
        FarmerResponse farmer = farmerService.create(request);
        return ResponseEntity.created(URI.create("/api/farmers/" + farmer.farmerId())).body(farmer);
    }

    @PutMapping("/{farmerId}")
    public FarmerResponse update(@PathVariable Long farmerId,
                                 @Valid @RequestBody UpdateFarmerRequest request) {
        return farmerService.update(farmerId, request);
    }

    @DeleteMapping("/{farmerId}")
    public ResponseEntity<Void> delete(@PathVariable Long farmerId) {
        farmerService.delete(farmerId);
        return ResponseEntity.noContent().build();
    }
}