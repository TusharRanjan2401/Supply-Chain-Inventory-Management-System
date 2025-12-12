package com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.request;

import lombok.Data;

@Data
public class InventoryItemRequest {
    private String sku;
    private String warehouseId;
    private Integer availableQty;
    private Integer reservedQty;
    private Integer incomingQty;
    private Integer threshold;
}
