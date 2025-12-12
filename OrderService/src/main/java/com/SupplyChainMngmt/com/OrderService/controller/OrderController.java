package com.SupplyChainMngmt.com.OrderService.controller;

import com.SupplyChainMngmt.com.OrderService.dto.requestDto.CreateOrderRequest;
import com.SupplyChainMngmt.com.OrderService.dto.requestDto.UpdateOrderStatusRequest;
import com.SupplyChainMngmt.com.OrderService.dto.resposneDto.OrderResponse;
import com.SupplyChainMngmt.com.OrderService.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request){
        OrderResponse response = orderService.createOrder(request);
        return  ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public  ResponseEntity<OrderResponse> getOrder(@PathVariable Long id){
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(){
        List<OrderResponse> orderResponseList = orderService.getAllOrders();
        return ResponseEntity.ok(orderResponseList);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id, @RequestBody UpdateOrderStatusRequest request){
        OrderResponse response = orderService.updateOrderStatus(id,request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id){
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
