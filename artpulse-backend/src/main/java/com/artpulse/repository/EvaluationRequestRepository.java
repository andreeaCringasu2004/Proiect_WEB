package com.artpulse.repository;

import com.artpulse.entity.EvaluationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationRequestRepository extends JpaRepository<EvaluationRequest, Long> {
}
