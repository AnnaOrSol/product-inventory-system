package com.example.productservice.service;

import com.example.productservice.dto.GenericProductResponse;
import com.example.productservice.model.GenericProduct;
import com.example.productservice.repository.GenericProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GenericProductService {

    private final GenericProductRepository genericProductRepository;

    public GenericProductService(GenericProductRepository genericProductRepository) {
        this.genericProductRepository = genericProductRepository;
    }

    public List<GenericProductResponse> getAll() {
        return genericProductRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<GenericProductResponse> getByCategory(String categoryCode) {
        return genericProductRepository.findAllByCategory_CodeOrderByNameAsc(categoryCode)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private GenericProductResponse toResponse(GenericProduct genericProduct) {
        return new GenericProductResponse(
                genericProduct.getId(),
                genericProduct.getName(),
                genericProduct.getCategory().getCode(),
                genericProduct.getCategory().getDisplayName(),
                genericProduct.getImageUrl()
        );
    }
}