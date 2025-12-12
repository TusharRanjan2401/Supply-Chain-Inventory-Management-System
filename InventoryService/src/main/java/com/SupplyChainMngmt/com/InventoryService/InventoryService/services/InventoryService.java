package com.SupplyChainMngmt.com.InventoryService.InventoryService.services;

import com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.request.AdjustStockRequest;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.request.InventoryItemRequest;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.response.InventoryItemResponse;

import java.util.List;

public interface InventoryService {
    InventoryItemResponse createOrUpdate(InventoryItemRequest request);

    InventoryItemResponse getById(Long id);

    List<InventoryItemResponse> getAll();

    List<InventoryItemResponse> getBySku(String sku);

    InventoryItemResponse getBySkuAndWarehouse(String sku,String warehouseId);

    InventoryItemResponse adjustStock(Long id, AdjustStockRequest request);

    InventoryItemResponse updateThreshold(Long id, Integer threshold);

    void delete(Long id);





}
