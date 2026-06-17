package com.artpulse.config;

import com.artpulse.entity.Category;
import com.artpulse.entity.Auction;
import com.artpulse.entity.Bid;
import com.artpulse.entity.User;
import com.artpulse.repository.CategoryRepository;
import com.artpulse.repository.AuctionRepository;
import com.artpulse.repository.BidRepository;
import com.artpulse.repository.UserRepository;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            CategoryRepository categoryRepository, 
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            UserRepository userRepository) {
        return args -> {
            List<String> categoryNames = List.of("Painting", "Sculpture", "Photography", "Abstract", "Mixed Media");
            for (String name : categoryNames) {
                if (!categoryRepository.existsByName(name)) {
                    Category category = new Category();
                    category.setName(name);
                    categoryRepository.save(category);
                }
            }

            // Update Silent Forms (id 2) to increase time by 22 hours if it exists
            auctionRepository.findById(2L).ifPresent(auction -> {
                LocalDateTime currentEnd = auction.getEndTime();
                LocalDateTime now = LocalDateTime.now();
                if (currentEnd != null && currentEnd.isBefore(now.plusDays(1))) {
                    auction.setEndTime(now.plusHours(27));
                    auctionRepository.save(auction);
                }
            });

            // Dynamically set future end times for auctions 15-20 to keep them active
            auctionRepository.findById(15L).ifPresent(a -> {
                a.setEndTime(LocalDateTime.now().plusHours(18));
                auctionRepository.save(a);
            });
            
            // Seed exactly 21 bids for Auction 16 if no bids exist yet, to match user UI screen
            auctionRepository.findById(16L).ifPresent(auction -> {
                auction.setEndTime(LocalDateTime.now().plusHours(36));
                auctionRepository.save(auction);

                if (bidRepository.findByAuction(auction).isEmpty()) {
                    User bidder1 = userRepository.findByEmail("bidder1@artpulse.com").orElse(null);
                    User bidder2 = userRepository.findByEmail("bidder2@artpulse.com").orElse(null);
                    User bidder3 = userRepository.findByEmail("bidder3@artpulse.com").orElse(null);

                    if (bidder1 != null && bidder2 != null && bidder3 != null) {
                        List<User> bidders = List.of(bidder1, bidder2, bidder3);
                        double startPrice = 1200;
                        for (int i = 1; i <= 21; i++) {
                            Bid bid = new Bid();
                            bid.setAuction(auction);
                            bid.setBidder(bidders.get(i % 3));
                            double amount = (i == 21) ? 3700 : (1200 + i * 115);
                            bid.setAmount(BigDecimal.valueOf(amount));
                            bid.setPlacedAt(LocalDateTime.now().minusHours(24).plusMinutes(i * 10));
                            bidRepository.save(bid);
                        }
                        auction.setCurrentPrice(BigDecimal.valueOf(3700));
                        auctionRepository.save(auction);
                    }
                }
            });

            auctionRepository.findById(17L).ifPresent(a -> {
                a.setEndTime(LocalDateTime.now().plusHours(50));
                auctionRepository.save(a);
            });
            auctionRepository.findById(18L).ifPresent(a -> {
                a.setEndTime(LocalDateTime.now().plusHours(120));
                auctionRepository.save(a);
            });
            auctionRepository.findById(19L).ifPresent(a -> {
                a.setEndTime(LocalDateTime.now().plusHours(72));
                auctionRepository.save(a);
            });
            auctionRepository.findById(20L).ifPresent(a -> {
                a.setEndTime(LocalDateTime.now().plusHours(48));
                auctionRepository.save(a);
            });
        };
    }
}
