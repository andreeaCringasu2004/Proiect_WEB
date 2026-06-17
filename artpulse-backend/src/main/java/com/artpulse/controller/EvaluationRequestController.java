package com.artpulse.controller;

import com.artpulse.entity.EvaluationRequest;
import com.artpulse.repository.EvaluationRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/evaluation-requests")
public class EvaluationRequestController {

    @Autowired
    private EvaluationRequestRepository evaluationRequestRepository;

    @GetMapping
    public List<EvaluationRequest> getAllRequests() {
        return evaluationRequestRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<EvaluationRequest> createRequest(@RequestBody EvaluationRequest request) {
        EvaluationRequest saved = evaluationRequestRepository.save(request);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequest(@PathVariable Long id, @RequestBody EvaluationRequest updatedDetails) {
        Optional<EvaluationRequest> optionalRequest = evaluationRequestRepository.findById(id);
        if (!optionalRequest.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        EvaluationRequest request = optionalRequest.get();
        request.setStatus(updatedDetails.getStatus());
        request.setAcceptedByExpertId(updatedDetails.getAcceptedByExpertId());
        
        EvaluationRequest saved = evaluationRequestRepository.save(request);
        return ResponseEntity.ok(saved);
    }
}
