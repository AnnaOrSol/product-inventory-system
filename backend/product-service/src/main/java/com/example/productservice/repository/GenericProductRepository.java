package com.example.productservice.repository;

import com.example.productservice.model.GenericProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GenericProductRepository extends JpaRepository<GenericProduct, Long> {
    List<GenericProduct> findAllByCategory_CodeOrderByNameAsc(String categoryCode);
    List<GenericProduct> findByDefaultRequirementTrueOrderByNameAsc();
}