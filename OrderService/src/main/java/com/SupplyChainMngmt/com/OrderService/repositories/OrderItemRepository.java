package com.SupplyChainMngmt.com.OrderService.repositories;

import com.SupplyChainMngmt.com.OrderService.entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
