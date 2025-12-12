package com.SupplyChainMngmt.com.OrderService.dto.resposneDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {
    private Long id;
    private String sku;
    private Integer quantity;
    private Double unitPrice;
}
