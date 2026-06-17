package com.artpulse;

import com.artpulse.entity.Product;
import com.artpulse.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest(classes = BackendApplication.class)
class BackendApplicationTests {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void contextLoads() {
    }

}

