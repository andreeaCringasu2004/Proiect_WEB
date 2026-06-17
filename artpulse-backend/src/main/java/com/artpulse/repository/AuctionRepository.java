package com.artpulse.repository;

import com.artpulse.entity.Auction;
import com.artpulse.entity.enums.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByStatus(AuctionStatus status);
    java.util.Optional<Auction> findByProductId(Long productId);
}
