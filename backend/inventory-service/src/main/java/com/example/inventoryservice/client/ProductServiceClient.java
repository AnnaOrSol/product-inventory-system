package com.example.inventoryservice.client;

import com.example.inventoryservice.dto.DefaultRequirementItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.product-service.base-url}")
    private String productServiceBaseUrl;

    public List<DefaultRequirementItemDto> getDefaultRequirementItems() {
        String url = productServiceBaseUrl + "/product/generic-products/default-requirements";

        ResponseEntity<List<DefaultRequirementItemDto>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<DefaultRequirementItemDto>>() {}
        );

        return response.getBody() != null ? response.getBody() : Collections.emptyList();
    }
}