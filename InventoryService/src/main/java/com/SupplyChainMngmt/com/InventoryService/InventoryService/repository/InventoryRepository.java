package com.SupplyChainMngmt.com.InventoryService.InventoryService.repository;

import com.SupplyChainMngmt.com.InventoryService.InventoryService.entities.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findBySku(String sku);
    Optional<InventoryItem> findBySkuAndWarehouseId(String sku, String warehouseId);
}
