package com.SupplyChainMngmt.com.OrderService.service.Impl;

import com.SupplyChainMngmt.com.OrderService.Exception.ResourceNotFoundException;
import com.SupplyChainMngmt.com.OrderService.dto.requestDto.CreateOrderRequest;
import com.SupplyChainMngmt.com.OrderService.dto.requestDto.OrderItemRequest;
import com.SupplyChainMngmt.com.OrderService.dto.requestDto.UpdateOrderStatusRequest;
import com.SupplyChainMngmt.com.OrderService.dto.resposneDto.OrderItemResponse;
import com.SupplyChainMngmt.com.OrderService.dto.resposneDto.OrderResponse;
import com.SupplyChainMngmt.com.OrderService.entities.Order;
import com.SupplyChainMngmt.com.OrderService.entities.OrderItem;
import com.SupplyChainMngmt.com.OrderService.entities.type.OrderStatus;
import com.SupplyChainMngmt.com.OrderService.event.OrderEventPublisher;
import com.SupplyChainMngmt.com.OrderService.repositories.OrderRepository;
import com.SupplyChainMngmt.com.OrderService.service.OrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;

    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        double amount = request.getItems().stream()
                .mapToDouble(i -> i.getUnitPrice()*i.getQuantity())
                .sum();

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .status(OrderStatus.CREATED)
                .totalAmount(amount)
                .build();

        if(request.getItems() != null){
            for(OrderItemRequest itemReq: request.getItems()){
                OrderItem item = OrderItem.builder()
                        .sku(itemReq.getSku())
                        .quantity(itemReq.getQuantity())
                        .unitPrice(itemReq.getUnitPrice())
                        .build();
                order.addItem(item);
            }
        }

        Order new_order = orderRepository.save(order);
        orderEventPublisher.publishOrderCreated(new_order);

        return mapToResponse(new_order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No Order found with this id: "+id));
        return mapToResponse(order);

    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("No order found with id: "+id));

        order.setStatus(request.getStatus());
        Order updated_order = orderRepository.save(order);
        orderEventPublisher.publishOrderStatusUpdate(updated_order);
        return mapToResponse(updated_order);
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Entity not found with id: "+id));

        orderRepository.delete(order);
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .sku(item.getSku())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
