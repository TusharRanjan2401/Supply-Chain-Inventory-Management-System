package com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class InventoryItemResponse {
    private Long id;
    private String sku;
    private String warehouseId;
    private Integer availableQty;
    private Integer reservedQty;
    private Integer incomingQty;
    private Integer threshold;
    private Instant updatedAt;
}
