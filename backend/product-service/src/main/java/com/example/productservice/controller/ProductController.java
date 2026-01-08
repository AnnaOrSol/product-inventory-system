package com.example.productservice.controller;

import com.example.productservice.dto.ProductResponse;
import com.example.productservice.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/product")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/{id}")
    public ProductResponse getIncident(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping("/items")
    public List<ProductResponse> getItems(){ return productService.getAllItems();}

    @GetMapping("/barcode/{barcode}")
    public ProductResponse getProductByBarcode (@PathVariable String barcode) { return productService.getProductByBarcode(barcode);}
}
