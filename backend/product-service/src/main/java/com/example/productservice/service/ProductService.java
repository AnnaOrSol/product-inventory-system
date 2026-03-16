package com.example.productservice.service;

import com.example.productservice.dto.CreateNewProductRequest;
import com.example.productservice.dto.ProductResponse;
import com.example.productservice.model.GenericProduct;
import com.example.productservice.model.Product;
import com.example.productservice.repository.GenericProductRepository;
import com.example.productservice.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository repository;
    private final GenericProductRepository genericProductRepository;

    public ProductService(ProductRepository repository,
                          GenericProductRepository genericProductRepository) {
        this.repository = repository;
        this.genericProductRepository = genericProductRepository;
    }

    public ProductResponse getProductById(Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product with id " + id + " not found"
                ));

        return toResponse(product);
    }

    public List<ProductResponse> getAllItems() {
        return repository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProductResponse> getProductsByGenericProductId(Long genericProductId) {
        return repository.findAllByGenericProduct_IdOrderByNameAsc(genericProductId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse getProductByBarcode(String barcode) {
        return repository.findByBarcode(barcode)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product with barcode " + barcode + " not found"
                ));
    }

    public ProductResponse createProduct(CreateNewProductRequest request) {
        if (request.getBarcode() != null && !request.getBarcode().isBlank()) {
            repository.findByBarcode(request.getBarcode()).ifPresent(existing -> {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Product with barcode " + request.getBarcode() + " already exists"
                );
            });
        }

        GenericProduct genericProduct = null;
        if (request.getGenericProductId() != null) {
            genericProduct = genericProductRepository.findById(request.getGenericProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Generic product with id " + request.getGenericProductId() + " not found"
                    ));
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setBarcode(request.getBarcode());
        product.setBrand(request.getBrand());
        product.setImageUrl(request.getImageUrl());
        product.setGenericProduct(genericProduct);

        Product saved = repository.save(product);

        log.info("Product created successfully. id={}, name={}, barcode={}",
                saved.getId(), saved.getName(), saved.getBarcode());

        return toResponse(saved);
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getBarcode(),
                product.getBrand(),
                product.getCreatedAt(),
                product.getImageUrl(),
                product.getGenericProduct() != null ? product.getGenericProduct().getId() : null,
                product.getGenericProduct() != null ? product.getGenericProduct().getName() : null
        );
    }
}