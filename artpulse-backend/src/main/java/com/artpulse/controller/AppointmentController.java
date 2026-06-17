package com.artpulse.controller;

import com.artpulse.entity.Appointment;
import com.artpulse.entity.Product;
import com.artpulse.entity.User;
import com.artpulse.entity.enums.AppointmentStatus;
import com.artpulse.repository.AppointmentRepository;
import com.artpulse.repository.ProductRepository;
import com.artpulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // GET /api/appointments — returns all appointments for current user (expert or seller)
    @GetMapping
    public ResponseEntity<?> getAppointments(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        List<Appointment> list;
        if ("expert".equalsIgnoreCase(user.getRole().name())) {
            list = appointmentRepository.findByExpertId(user.getId());
        } else {
            list = appointmentRepository.findBySellerId(user.getId());
        }
        
        List<FrontendAppointmentDTO> dtos = list.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // POST /api/appointments — schedules a new appointment (EXPERT)
    @PostMapping
    public ResponseEntity<?> createAppointment(Authentication authentication, @RequestBody FrontendAppointmentDTO dto) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User expert = userOpt.get();
        
        Product product = productRepository.findById(dto.getProductId()).orElse(null);
        User seller = userRepository.findById(dto.getSellerId()).orElse(null);
        if (product == null || seller == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid product or seller ID"));
        }

        Appointment appt = new Appointment();
        appt.setProduct(product);
        appt.setExpert(expert);
        appt.setSeller(seller);
        appt.setLocation(dto.getLocation() != null ? dto.getLocation() : "Sediul ArtPulse");
        appt.setStatus(AppointmentStatus.SCHEDULED);
        appt.setNotes(dto.getNotes());
        
        if (dto.getDate() != null) {
            try {
                // ISO_DATE_TIME parsing (e.g. 2026-05-21T17:15:30.000Z or similar)
                String dateStr = dto.getDate();
                if (dateStr.endsWith("Z")) {
                    dateStr = dateStr.substring(0, dateStr.length() - 1);
                }
                appt.setAppointmentDate(LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception e) {
                appt.setAppointmentDate(LocalDateTime.now().plusDays(1));
            }
        } else {
            appt.setAppointmentDate(LocalDateTime.now().plusDays(1));
        }

        Appointment saved = appointmentRepository.save(appt);
        return ResponseEntity.ok(toDTO(saved));
    }

    private FrontendAppointmentDTO toDTO(Appointment appt) {
        FrontendAppointmentDTO dto = new FrontendAppointmentDTO();
        dto.setId(appt.getId());
        dto.setProductId(appt.getProduct() != null ? appt.getProduct().getId() : null);
        dto.setExpertId(appt.getExpert() != null ? appt.getExpert().getId() : null);
        dto.setSellerId(appt.getSeller() != null ? appt.getSeller().getId() : null);
        dto.setLocation(appt.getLocation());
        dto.setNotes(appt.getNotes());
        dto.setStatus(appt.getStatus() != null ? appt.getStatus().name() : "SCHEDULED");
        if (appt.getAppointmentDate() != null) {
            dto.setDate(appt.getAppointmentDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        return dto;
    }

    public static class FrontendAppointmentDTO {
        private Long id;
        private Long productId;
        private Long expertId;
        private Long sellerId;
        private String date;
        private String location;
        private String status;
        private String notes;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Long getExpertId() { return expertId; }
        public void setExpertId(Long expertId) { this.expertId = expertId; }
        public Long getSellerId() { return sellerId; }
        public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
