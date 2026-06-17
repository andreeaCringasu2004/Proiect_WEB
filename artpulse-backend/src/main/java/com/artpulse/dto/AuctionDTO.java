package com.artpulse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Auction — maps backend Auction entity to the shape the frontend expects.
 * Frontend Auction interface: id, productId, title, artist, category, image,
 * currentBid, startingBid, endsAt, status, bidsCount, winnerName,
 * year, medium, dimensions, condition, provenance
 */
public class AuctionDTO {

    private Long id;
    private Long productId;
    private String title;
    private String artist;
    private String category;
    private String image;          // first image URL
    private BigDecimal currentBid;
    private BigDecimal startingBid;
    private LocalDateTime endsAt;
    private String status;         // "active" | "upcoming" | "sold"
    private int bidsCount;
    private String winnerName;
    private Integer year;
    private String medium;
    private String dimensions;
    private String condition;
    private String provenance;
    private List<String> images;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public BigDecimal getCurrentBid() { return currentBid; }
    public void setCurrentBid(BigDecimal currentBid) { this.currentBid = currentBid; }
    public BigDecimal getStartingBid() { return startingBid; }
    public void setStartingBid(BigDecimal startingBid) { this.startingBid = startingBid; }
    public LocalDateTime getEndsAt() { return endsAt; }
    public void setEndsAt(LocalDateTime endsAt) { this.endsAt = endsAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getBidsCount() { return bidsCount; }
    public void setBidsCount(int bidsCount) { this.bidsCount = bidsCount; }
    public String getWinnerName() { return winnerName; }
    public void setWinnerName(String winnerName) { this.winnerName = winnerName; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public String getMedium() { return medium; }
    public void setMedium(String medium) { this.medium = medium; }
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public String getProvenance() { return provenance; }
    public void setProvenance(String provenance) { this.provenance = provenance; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
