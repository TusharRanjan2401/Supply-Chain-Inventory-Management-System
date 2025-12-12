package com.SupplyChainMngmt.com.OrderService.event;

import com.SupplyChainMngmt.com.OrderService.entities.type.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class OrderEvent {
    private String eventType;
    private Long orderId;
    private String customerId;
    private OrderStatus status;
    private Double totalAmount;
    private List<OrderItemSummary> items;
    private Instant createdAt;
    private Instant eventTime;

    @Data
    @Builder
    public static class OrderItemSummary {
        private String sku;
        private Integer quantity;
    }
}
