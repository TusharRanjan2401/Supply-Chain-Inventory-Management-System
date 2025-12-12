package com.SupplyChainMngmt.com.OrderService.dto.requestDto;

import com.SupplyChainMngmt.com.OrderService.entities.type.OrderStatus;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    private OrderStatus status;
}
