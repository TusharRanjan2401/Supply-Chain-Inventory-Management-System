package com.SupplyChainMngmt.com.OrderService.event;

import com.SupplyChainMngmt.com.OrderService.entities.Order;
import com.SupplyChainMngmt.com.OrderService.entities.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    @Value("${app.topics.order-events:order.events}")
    private String orderEventsTopics;

    public void publishOrderCreated(Order order){
        OrderEvent event = OrderEvent.builder()
                .eventType("ORDER_CREATED")
                .orderId(order.getId())
                .customerId(order.getCustomerId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .eventTime(Instant.now())
                .items(order.getItems().stream()
                        .map(this::mapItem)
                        .collect(Collectors.toList()))
                .build();

        kafkaTemplate.send(orderEventsTopics, String.valueOf(order.getId()), event);
    }

    public void publishOrderStatusUpdate(Order order){
        OrderEvent event = OrderEvent.builder()
                .eventType("ORDER_STATUS_UPDATED")
                .orderId(order.getId())
                .customerId(order.getCustomerId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .eventTime(Instant.now())
                .items(order.getItems().stream()
                        .map(this::mapItem)
                        .collect(Collectors.toList()))
                .build();

        kafkaTemplate.send(orderEventsTopics, String.valueOf(order.getId()), event);
    }

    private OrderEvent.OrderItemSummary mapItem(OrderItem item){
        return OrderEvent.OrderItemSummary.builder()
                .sku(item.getSku())
                .quantity(item.getQuantity())
                .build();
    }
}
