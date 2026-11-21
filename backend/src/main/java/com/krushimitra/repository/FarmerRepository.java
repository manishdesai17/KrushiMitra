package com.krushimitra.repository;

import com.krushimitra.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    java.util.Optional<Farmer> findByMobileNumber(String mobileNumber);

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByMobileNumberAndFarmerIdNot(String mobileNumber, Long farmerId);
}