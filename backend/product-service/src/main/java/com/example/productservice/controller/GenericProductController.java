package com.example.productservice.controller;

import com.example.productservice.dto.DefaultRequirementItemResponse;
import com.example.productservice.dto.GenericProductResponse;
import com.example.productservice.service.GenericProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/product/generic-products")
public class GenericProductController {

    private final GenericProductService genericProductService;

    public GenericProductController(GenericProductService genericProductService) {
        this.genericProductService = genericProductService;
    }

    @GetMapping
    public List<GenericProductResponse> getGenericProducts(
            @RequestParam(required = false) String categoryCode
    ) {
        if (categoryCode != null && !categoryCode.isBlank()) {
            return genericProductService.getByCategory(categoryCode);
        }
        return genericProductService.getAll();
    }

    @GetMapping("/default-requirements")
    public ResponseEntity<List<DefaultRequirementItemResponse>> getDefaultRequirements() {
        return ResponseEntity.ok(genericProductService.getDefaultRequirements());
    }
}