package com.artpulse.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evaluation_requests")
public class EvaluationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(columnDefinition = "TEXT")
    private String message;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "evaluation_request_documents", joinColumns = @JoinColumn(name = "evaluation_request_id"))
    @Column(name = "document_name")
    private List<String> documents = new ArrayList<>();

    @Column(name = "sent_at")
    private String sentAt;

    @Column(nullable = false)
    private String status = "pending";

    @Column(name = "accepted_by_expert_id")
    private Long acceptedByExpertId;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getDocuments() {
        return documents;
    }

    public void setDocuments(List<String> documents) {
        this.documents = documents;
    }

    public String getSentAt() {
        return sentAt;
    }

    public void setSentAt(String sentAt) {
        this.sentAt = sentAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getAcceptedByExpertId() {
        return acceptedByExpertId;
    }

    public void setAcceptedByExpertId(Long acceptedByExpertId) {
        this.acceptedByExpertId = acceptedByExpertId;
    }
}
