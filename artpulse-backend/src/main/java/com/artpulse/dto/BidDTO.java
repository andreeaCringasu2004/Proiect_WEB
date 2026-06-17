package com.artpulse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Bid — maps backend Bid entity to the shape the frontend expects.
 * Frontend Bid interface: id, auctionId, bidder, amount, time
 */
public class BidDTO {
    private Long id;
    private Long auctionId;
    private String bidder;  // bidder's fullName
    private Long bidderId;
    private BigDecimal amount;
    private LocalDateTime placedAt;
    private String time;    // human-readable relative time (computed on client)

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }
    public String getBidder() { return bidder; }
    public void setBidder(String bidder) { this.bidder = bidder; }
    public Long getBidderId() { return bidderId; }
    public void setBidderId(Long bidderId) { this.bidderId = bidderId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDateTime getPlacedAt() { return placedAt; }
    public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
}
