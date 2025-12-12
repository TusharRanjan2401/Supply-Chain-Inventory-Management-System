package com.SupplyChainMngmt.com.InventoryService.InventoryService.events;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class InventoryEvent {

    private String eventType;
    private Long inventoryId;
    private String sku;
    private String warehouseId;
    private Integer availableQty;
    private Integer reservedQty;
    private Integer incomingQty;
    private Integer threshold;

    private Instant updatedAt;
    private Instant eventTime;
}
