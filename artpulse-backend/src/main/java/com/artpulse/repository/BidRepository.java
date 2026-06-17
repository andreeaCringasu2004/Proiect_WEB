package com.artpulse.repository;

import com.artpulse.entity.Auction;
import com.artpulse.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuction(Auction auction);

    List<Bid> findByAuctionId(Long auctionId);

    List<Bid> findByBidderId(Long bidderId);
}
