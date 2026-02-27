package com.example.inventoryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ShoppngListItemResponse {
    private Long productId;
    private String productName;
    private Integer currentQuantity;
    private Integer requiredQuantity;
    private Integer missingQuantity;
}