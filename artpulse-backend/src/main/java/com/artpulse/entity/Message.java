package com.artpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = true)
    private User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_context_id", nullable = true)
    private Product productContext;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "message_documents", joinColumns = @JoinColumn(name = "message_id"))
    @Column(name = "document_url", columnDefinition = "TEXT")
    private java.util.List<String> documents = new java.util.ArrayList<>();

    @Column(name = "is_appointment_proposal")
    private Boolean isAppointmentProposal = false;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "sent_at", insertable = false, updatable = false)
    private LocalDateTime sentAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }
    public Product getProductContext() { return productContext; }
    public void setProductContext(Product productContext) { this.productContext = productContext; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
    public java.util.List<String> getDocuments() { return documents; }
    public void setDocuments(java.util.List<String> documents) { this.documents = documents; }
    public Boolean getIsAppointmentProposal() { return isAppointmentProposal; }
    public void setIsAppointmentProposal(Boolean isAppointmentProposal) { this.isAppointmentProposal = isAppointmentProposal; }
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
