package com.artpulse.repository;

import com.artpulse.entity.Product;
import com.artpulse.entity.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerId(Long sellerId);
    List<Product> findByStatus(ProductStatus status);
}
