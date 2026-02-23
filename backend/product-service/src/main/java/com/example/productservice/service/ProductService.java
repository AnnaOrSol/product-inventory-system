package com.example.productservice.service;

import com.example.productservice.dto.CreateNewProductRequest;
import com.example.productservice.dto.ProductResponse;
import com.example.productservice.model.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.example.productservice.repository.ProductRepository;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository repository;
    private static final Logger log =
            LoggerFactory.getLogger(ProductService.class);

    public ProductService(ProductRepository repository){
        this.repository=repository;
    }

    public ProductResponse getProductById(Long id) {

        Product product = repository.findById(id)
                .orElseThrow(() -> new NullPointerException());

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getBrand(),
                product.getBarcode(),
                product.getCategory(),
                product.getCreatedAt(),
                product.getImageUrl()
        );
    }

    public List<ProductResponse> getAllItems() {
        List<Product> productList = repository.findAll();
        return productList.stream()
                .map(product -> new ProductResponse(                    product.getId(),
                        product.getName(),
                        product.getBrand(),
                        product.getBarcode(),
                        product.getCategory(),
                        product.getCreatedAt(),
                        product.getImageUrl()))
                .toList();
    }

    public ProductResponse getProductByBarcode(String barcode) {
        return repository.findByBarcode(barcode)
                .map(product -> new ProductResponse(
                        product.getId(),
                        product.getName(),
                        product.getBrand(),
                        product.getBarcode(),
                        product.getCategory(),
                        product.getCreatedAt(),
                        product.getImageUrl()
                ))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product with barcode " + barcode + " not found"
                ));
    }

    public ProductResponse addProductByBarcode(CreateNewProductRequest request) {
        Product product = new Product();
        product.setBarcode(request.getBarcode());
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setCategory(request.getCategory());


        Product saved = repository.save(product);
        log.info("Item {} added successfully", saved.getId());
        return new ProductResponse(
                saved.getId(),
                saved.getName(),
                saved.getBrand(),
                saved.getBarcode(),
                saved.getCategory(),
                saved.getCreatedAt(),
                saved.getImageUrl()
        );
    }
}
