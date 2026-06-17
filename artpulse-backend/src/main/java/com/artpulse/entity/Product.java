package com.artpulse.entity;

import com.artpulse.entity.enums.ProductStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "createdByExpert"})
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User seller;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "expert_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User expert;

    @Column(name = "suggested_price")
    private BigDecimal suggestedPrice;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'UNKNOWN'")
    private ProductStatus status = ProductStatus.UNKNOWN;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "artist")
    private String artist;

    @Column(name = "year")
    private Integer year;

    @Column(name = "medium")
    private String medium;

    @Column(name = "dimensions")
    private String dimensions;

    @Column(name = "item_condition")
    private String itemCondition;

    @Column(name = "provenance", columnDefinition = "TEXT")
    private String provenance;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_documents", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "document_url", columnDefinition = "TEXT")
    private List<String> documents = new ArrayList<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }
    public User getExpert() { return expert; }
    public void setExpert(User expert) { this.expert = expert; }
    public BigDecimal getSuggestedPrice() { return suggestedPrice; }
    public void setSuggestedPrice(BigDecimal suggestedPrice) { this.suggestedPrice = suggestedPrice; }
    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public String getMedium() { return medium; }
    public void setMedium(String medium) { this.medium = medium; }
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    public String getItemCondition() { return itemCondition; }
    public void setItemCondition(String itemCondition) { this.itemCondition = itemCondition; }
    public String getProvenance() { return provenance; }
    public void setProvenance(String provenance) { this.provenance = provenance; }
    public List<String> getDocuments() { return documents; }
    public void setDocuments(List<String> documents) { this.documents = documents; }
}
