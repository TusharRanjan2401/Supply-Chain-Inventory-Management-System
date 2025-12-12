package com.SupplyChainMngmt.com.OrderService.dto.resposneDto;

import com.SupplyChainMngmt.com.OrderService.entities.type.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String customerId;
    private OrderStatus status;
    private Double totalAmount;
    private Instant createdAt;
    private Instant updatedAt;
    private List<OrderItemResponse> items;
}
