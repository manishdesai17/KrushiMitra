package com.krushimitra.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "mst_farmer")
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "farmer_id")
    private Long farmerId;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "mobile_number", nullable = false, unique = true, length = 10)
    private String mobileNumber;

    @Column(length = 254)
    private String email;

    @Column(nullable = false, length = 100)
    private String village;

    @Column(nullable = false, length = 100)
    private String taluka;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "preferred_language", nullable = false, length = 2)
    private String preferredLanguage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Farmer() {
    }

    public Farmer(User user, String fullName, String mobileNumber, String email,
                  String village, String taluka, String district, String state, String preferredLanguage) {
        this.user = user;
        updateProfile(fullName, mobileNumber, email, village, taluka, district, state);
        this.preferredLanguage = preferredLanguage;
    }

    public void updateProfile(String fullName, String mobileNumber, String email,
                              String village, String taluka, String district, String state) {
        this.fullName = fullName;
        this.mobileNumber = mobileNumber;
        this.email = email;
        this.village = village;
        this.taluka = taluka;
        this.district = district;
        this.state = state;
    }

    public void updatePreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public String getEmail() {
        return email;
    }

    public String getVillage() {
        return village;
    }

    public String getTaluka() {
        return taluka;
    }

    public String getDistrict() {
        return district;
    }

    public String getState() {
        return state;
    }

    public User getUser() {
        return user;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}