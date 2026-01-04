package com.example.productservice.service;

import com.example.productservice.dto.ProductResponse;
import com.example.productservice.model.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.example.productservice.repository.ProductRepository;

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
                product.getCategory(),
                product.getCreatedAt()
        );
    }

    public List<ProductResponse> getAllItems() {
        List<Product> productList = repository.findAll();
        return productList.stream()
                .map(product -> new ProductResponse(product.getId(),
                        product.getName(),
                        product.getBrand(),
                        product.getCategory(),
                        product.getCreatedAt()))
                .toList();
    }

}
