package com.artpulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "bids"})
    private Auction auction;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bidder_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User bidder;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "bid_time")
    private LocalDateTime placedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }
    public User getBidder() { return bidder; }
    public void setBidder(User bidder) { this.bidder = bidder; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDateTime getPlacedAt() { return placedAt; }
    public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }
}
