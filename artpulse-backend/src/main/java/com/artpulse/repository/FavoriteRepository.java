package com.artpulse.repository;

import com.artpulse.entity.Favorite;
import com.artpulse.entity.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    List<Favorite> findByIdUserId(Long userId);
    
    @Transactional
    void deleteByIdUserIdAndIdProductId(Long userId, Long productId);
    
    boolean existsByIdUserIdAndIdProductId(Long userId, Long productId);
}
