package com.SupplyChainMngmt.com.InventoryService.InventoryService.events;

import com.SupplyChainMngmt.com.InventoryService.InventoryService.entities.InventoryItem;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class InventoryEventPublisher {

    private final KafkaTemplate<String, InventoryEvent> kafkaTemplate;

    @Value("${app.topics.inventory-events:inventory.events}")
    private String inventoryEventsTopic;

    public void publishStockUpdated(InventoryItem item){
        InventoryEvent event = InventoryEvent.builder()
                .eventType("STOCK_UPDATED")
                .inventoryId(item.getId())
                .sku(item.getSku())
                .warehouseId(item.getWarehouseId())
                .availableQty(item.getAvailableQty())
                .reservedQty(item.getReservedQty())
                .incomingQty(item.getIncomingQty())
                .threshold(item.getThreshold())
                .updatedAt(item.getUpdatedAt())
                .eventTime(Instant.now())
                .build();

        String key = item.getSku() + ":" + item.getWarehouseId();
        kafkaTemplate.send(inventoryEventsTopic, key, event);
    }

    public void publishLowStock(InventoryItem item){
        InventoryEvent event = InventoryEvent.builder()
                .eventType("LOW_STOCK")
                .inventoryId(item.getId())
                .sku(item.getSku())
                .warehouseId(item.getWarehouseId())
                .availableQty(item.getAvailableQty())
                .reservedQty(item.getReservedQty())
                .incomingQty(item.getIncomingQty())
                .threshold(item.getThreshold())
                .updatedAt(item.getUpdatedAt())
                .eventTime(Instant.now())
                .build();

        String key = item.getSku()+ ":" + item.getWarehouseId();
        kafkaTemplate.send(inventoryEventsTopic, key, event);
    }
}
