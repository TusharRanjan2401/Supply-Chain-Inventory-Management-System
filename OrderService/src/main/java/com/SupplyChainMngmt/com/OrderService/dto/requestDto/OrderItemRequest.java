package com.SupplyChainMngmt.com.OrderService.dto.requestDto;

import lombok.Data;

import java.util.List;

@Data
public class OrderItemRequest {
    private String sku;
    private Integer quantity;
    private Double unitPrice;
}
