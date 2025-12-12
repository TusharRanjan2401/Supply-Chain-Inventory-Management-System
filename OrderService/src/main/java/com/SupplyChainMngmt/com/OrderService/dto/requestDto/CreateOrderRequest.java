package com.SupplyChainMngmt.com.OrderService.dto.requestDto;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private String customerId;
    private List<OrderItemRequest> items;
}
