package com.artpulse.repository;

import com.artpulse.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByExpertId(Long expertId);
    List<Appointment> findBySellerId(Long sellerId);
}
