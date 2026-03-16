package com.example.productservice.repository;

import com.example.productservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByBarcode(String barcode);
    List<Product> findAllByOrderByNameAsc();
    List<Product> findAllByGenericProduct_IdOrderByNameAsc(Long genericProductId);
}
