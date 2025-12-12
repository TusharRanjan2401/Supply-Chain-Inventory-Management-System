package com.SupplyChainMngmt.com.OrderService.repositories;

import com.SupplyChainMngmt.com.OrderService.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
