package com.artpulse.controller;

import com.artpulse.entity.Product;
import com.artpulse.entity.Auction;
import com.artpulse.entity.enums.ProductStatus;
import com.artpulse.entity.enums.AuctionStatus;
import com.artpulse.repository.ProductRepository;
import com.artpulse.repository.AuctionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    // GET /api/products — toate produsele (public)
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // GET /api/products/active — doar produsele aprobate (public)
    @GetMapping("/active")
    public List<Product> getActiveProducts() {
        return productRepository.findByStatus(ProductStatus.APPROVED);
    }

    // GET /api/products/pending — produse in asteptare (EXPERT/ADMIN)
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('EXPERT', 'ADMIN')")
    public List<Product> getPendingProducts() {
        return productRepository.findByStatus(ProductStatus.PENDING);
    }

    // GET /api/products/{id} — detalii produs (public)
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/products/seller/{sellerId} — produse dupa vanzator
    @GetMapping("/seller/{sellerId}")
    public List<Product> getProductsBySeller(@PathVariable Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    // POST /api/products — adauga produs nou (SELLER)
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        product.setStatus(ProductStatus.PENDING);
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    // PUT /api/products/{id}/approve — aproba produs (EXPERT/ADMIN)
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('EXPERT', 'ADMIN')")
    public ResponseEntity<?> approveProduct(@PathVariable Long id) {
        return productRepository.findById(id).map(product -> {
            product.setStatus(ProductStatus.APPROVED);
            productRepository.save(product);

            if (auctionRepository.findByProductId(product.getId()).isEmpty()) {
                Auction auction = new Auction();
                auction.setProduct(product);
                BigDecimal startPrice = product.getSuggestedPrice() != null 
                        ? product.getSuggestedPrice() 
                        : BigDecimal.valueOf(1000);
                auction.setStartPrice(startPrice);
                auction.setCurrentPrice(startPrice);
                auction.setStartTime(LocalDateTime.now());
                auction.setEndTime(LocalDateTime.now().plusDays(7));
                auction.setStatus(AuctionStatus.UPCOMING);
                auctionRepository.save(auction);
            }

            return ResponseEntity.ok("Product approved!");
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/products/{id}/reject — respinge produs cu motiv (EXPERT/ADMIN)
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('EXPERT', 'ADMIN')")
    public ResponseEntity<?> rejectProduct(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        return productRepository.findById(id).map(product -> {
            product.setStatus(ProductStatus.REJECTED);
            if (body != null && body.containsKey("reason")) {
                product.setRejectionReason(body.get("reason"));
            }
            productRepository.save(product);
            return ResponseEntity.ok("Product rejected!");
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/products/{id} — actualizeaza produs (SELLER/ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setTitle(productDetails.getTitle());
            product.setDescription(productDetails.getDescription());
            product.setMedium(productDetails.getMedium());
            product.setYear(productDetails.getYear());
            product.setDimensions(productDetails.getDimensions());
            product.setArtist(productDetails.getArtist());
            product.setProvenance(productDetails.getProvenance());
            if (productDetails.getImages() != null) {
                product.getImages().clear();
                product.getImages().addAll(productDetails.getImages());
            }
            if (productDetails.getDocuments() != null) {
                product.getDocuments().clear();
                product.getDocuments().addAll(productDetails.getDocuments());
            }
            Product updated = productRepository.save(product);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
