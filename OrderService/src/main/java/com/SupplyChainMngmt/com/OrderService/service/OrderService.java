package com.SupplyChainMngmt.com.OrderService.service;

import com.SupplyChainMngmt.com.OrderService.dto.requestDto.CreateOrderRequest;
import com.SupplyChainMngmt.com.OrderService.dto.requestDto.UpdateOrderStatusRequest;
import com.SupplyChainMngmt.com.OrderService.dto.resposneDto.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrderById(Long id);

    List<OrderResponse> getAllOrders();

    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    void deleteOrder(Long id);

}
