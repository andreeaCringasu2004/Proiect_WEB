package com.artpulse.entity;

import com.artpulse.entity.enums.Role;
import com.artpulse.entity.enums.UserStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // nu apare in raspuns JSON
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'ACTIVE'")
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "is_card_validated")
    private Boolean isCardValidated = false;

    @Column(name = "password_reset_required", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean passwordResetRequired = false;

    @Column(name = "physical_address", columnDefinition = "TEXT")
    private String physicalAddress;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public Boolean getIsCardValidated() { return isCardValidated; }
    public void setIsCardValidated(Boolean isCardValidated) { this.isCardValidated = isCardValidated; }
    public Boolean getPasswordResetRequired() { return passwordResetRequired; }
    public void setPasswordResetRequired(Boolean passwordResetRequired) { this.passwordResetRequired = passwordResetRequired; }
    public String getPhysicalAddress() { return physicalAddress; }
    public void setPhysicalAddress(String physicalAddress) { this.physicalAddress = physicalAddress; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
