package com.artpulse.controller;

import com.artpulse.dto.AuctionDTO;
import com.artpulse.dto.BidDTO;
import com.artpulse.entity.Auction;
import com.artpulse.entity.Bid;
import com.artpulse.entity.User;
import com.artpulse.entity.enums.AuctionStatus;
import com.artpulse.repository.AuctionRepository;
import com.artpulse.repository.BidRepository;
import com.artpulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private UserRepository userRepository;

    // ─── Helpers ────────────────────────────────────────────────────────────

    private AuctionDTO toDTO(Auction a) {
        AuctionDTO dto = new AuctionDTO();
        dto.setId(a.getId());
        dto.setStartingBid(a.getStartPrice());
        dto.setCurrentBid(a.getCurrentPrice() != null ? a.getCurrentPrice() : a.getStartPrice());
        dto.setEndsAt(a.getEndTime());
        // Map DB status to frontend status string
        String status;
        switch (a.getStatus()) {
            case ACTIVE: status = "active"; break;
            case CLOSED: status = "sold"; break;
            default: status = "upcoming"; break;
        }
        dto.setStatus(status);

        // Count bids
        List<Bid> bids = bidRepository.findByAuction(a);
        dto.setBidsCount(bids.size());

        // Winner: highest bidder in closed auctions
        if (a.getStatus() == AuctionStatus.CLOSED && !bids.isEmpty()) {
            Bid winning = bids.stream()
                    .max((b1, b2) -> b1.getAmount().compareTo(b2.getAmount()))
                    .orElse(null);
            if (winning != null && winning.getBidder() != null) {
                String bidderName = winning.getBidder().getFullName();
                // Mask: show first name + ***
                if (bidderName != null && bidderName.contains(" ")) {
                    dto.setWinnerName(bidderName.split(" ")[0] + " ***");
                } else {
                    dto.setWinnerName(bidderName);
                }
            }
        }

        // Product-related fields
        if (a.getProduct() != null) {
            var p = a.getProduct();
            dto.setProductId(p.getId());
            dto.setTitle(p.getTitle());
            dto.setArtist(p.getArtist());
            dto.setYear(p.getYear());
            dto.setMedium(p.getMedium());
            dto.setDimensions(p.getDimensions());
            dto.setCondition(p.getItemCondition());
            dto.setProvenance(p.getProvenance());
            if (p.getCategory() != null) {
                dto.setCategory(p.getCategory().getName());
            }
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                dto.setImage(p.getImages().get(0));
                dto.setImages(p.getImages());
            }
        }
        return dto;
    }

    private BidDTO toBidDTO(Bid b) {
        BidDTO dto = new BidDTO();
        dto.setId(b.getId());
        if (b.getAuction() != null) dto.setAuctionId(b.getAuction().getId());
        if (b.getBidder() != null) {
            // Mask name: "Collector ***XX"
            String name = b.getBidder().getFullName();
            if (name != null) {
                String masked = "Collector ***" + (b.getId() % 100);
                dto.setBidder(masked);
            }
            dto.setBidderId(b.getBidder().getId());
        }
        dto.setAmount(b.getAmount());
        dto.setPlacedAt(b.getPlacedAt());
        dto.setTime(b.getPlacedAt() != null
                ? b.getPlacedAt().format(DateTimeFormatter.ofPattern("HH:mm dd/MM"))
                : "N/A");
        return dto;
    }

    // ─── Endpoints ──────────────────────────────────────────────────────────

    // GET /api/auctions — toate licitatiile (public), returneaza DTO
    @GetMapping
    public List<AuctionDTO> getAllAuctions() {
        return auctionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // GET /api/auctions/active — doar licitatii ACTIVE (public)
    @GetMapping("/active")
    public List<AuctionDTO> getActiveAuctions() {
        return auctionRepository.findByStatus(AuctionStatus.ACTIVE).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // GET /api/auctions/{id} — detalii licitatie (public)
    @GetMapping("/{id}")
    public ResponseEntity<?> getAuction(@PathVariable Long id) {
        return auctionRepository.findById(id)
                .map(a -> ResponseEntity.ok(toDTO(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/auctions/{id}/bids — ofertele pentru o licitatie (public)
    @GetMapping("/{id}/bids")
    public ResponseEntity<?> getBidsForAuction(@PathVariable Long id) {
        return auctionRepository.findById(id).map(auction -> {
            List<BidDTO> bids = bidRepository.findByAuction(auction).stream()
                    .sorted((b1, b2) -> b2.getAmount().compareTo(b1.getAmount()))
                    .map(this::toBidDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(bids);
        }).orElse(ResponseEntity.notFound().build());
    }

    // POST /api/auctions/{id}/bid — plaseaza o oferta (necesita autentificare)
    @PostMapping("/{id}/bid")
    public ResponseEntity<?> placeBid(
            @PathVariable Long id,
            @RequestBody Map<String, Double> body,
            Authentication authentication) {

        Double amount = body.get("amount");
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Suma invalida!"));
        }

        return auctionRepository.findById(id).map(auction -> {
            if (auction.getStatus() != AuctionStatus.ACTIVE) {
                return ResponseEntity.badRequest().body(Map.of("error", "Licitatia nu este activa!"));
            }
            if (auction.getCurrentPrice() != null &&
                    BigDecimal.valueOf(amount).compareTo(auction.getCurrentPrice()) <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Oferta trebuie sa fie mai mare decat " + auction.getCurrentPrice()));
            }

            User bidder = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User negasit"));

            Bid bid = new Bid();
            bid.setAuction(auction);
            bid.setBidder(bidder);
            bid.setAmount(BigDecimal.valueOf(amount));
            bid.setPlacedAt(LocalDateTime.now());
            bidRepository.save(bid);

            auction.setCurrentPrice(BigDecimal.valueOf(amount));
            auctionRepository.save(auction);

            BidDTO bidDTO = toBidDTO(bid);
            bidDTO.setAuctionId(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Oferta plasata cu succes!",
                    "currentPrice", amount,
                    "bid", bidDTO
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/auctions/{id}/close — incheie o licitatie manual (ADMIN)
    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> closeAuction(@PathVariable Long id) {
        return auctionRepository.findById(id).map(auction -> {
            auction.setStatus(AuctionStatus.CLOSED);
            auctionRepository.save(auction);
            return ResponseEntity.ok(Map.of("message", "Auction closed successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/auctions/{id}/start — activeaza o licitatie (ADMIN/SELLER)
    @PutMapping("/{id}/start")
    public ResponseEntity<?> startAuction(@PathVariable Long id) {
        return auctionRepository.findById(id).map(auction -> {
            auction.setStatus(AuctionStatus.ACTIVE);
            auctionRepository.save(auction);
            return ResponseEntity.ok(Map.of("message", "Auction started successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // GET /api/auctions/bids — toate ofertele din sistem
    @GetMapping("/bids")
    public ResponseEntity<List<BidDTO>> getAllBids() {
        List<BidDTO> bids = bidRepository.findAll().stream()
                .map(this::toBidDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bids);
    }
}
