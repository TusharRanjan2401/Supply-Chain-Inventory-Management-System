package com.SupplyChainMngmt.com.InventoryService.InventoryService.controllers;

import com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.request.AdjustStockRequest;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.request.InventoryItemRequest;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.response.InventoryItemResponse;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.services.InventoryService;
import jakarta.ws.rs.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<InventoryItemResponse> createInventory(@RequestBody InventoryItemRequest request){
        InventoryItemResponse response = inventoryService.createOrUpdate(request);
        return  ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<InventoryItemResponse>> getAllInventory(){
        List<InventoryItemResponse> response = inventoryService.getAll();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<InventoryItemResponse> getInventoryById(@PathVariable Long id){
        InventoryItemResponse response = inventoryService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{sku}")
    public ResponseEntity<List<InventoryItemResponse>> getInventoryBySku(@PathVariable String sku){
        List<InventoryItemResponse> response = inventoryService.getBySku(sku);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{sku}/{warehouseId}")
    public ResponseEntity<InventoryItemResponse> getInventoryBySkuAndWarehouseId(@PathVariable String sku, @PathVariable String warehouseId){
       InventoryItemResponse response =  inventoryService.getBySkuAndWarehouse(sku,warehouseId);
       return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/adjustStock")
    public ResponseEntity<InventoryItemResponse> adjustStockHandle(@PathVariable Long id, @RequestBody AdjustStockRequest request){
        InventoryItemResponse response = inventoryService.adjustStock(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/threshold")
    public ResponseEntity<InventoryItemResponse> updateThresholdHandler(@PathVariable Long id, @RequestBody Integer threshold){
        InventoryItemResponse response = inventoryService.updateThreshold(id,threshold);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id){
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
