package com.SupplyChainMngmt.com.InventoryService.InventoryService.services.impl;

import com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.request.AdjustStockRequest;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.request.InventoryItemRequest;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.dto.response.InventoryItemResponse;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.entities.InventoryItem;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.events.InventoryEventPublisher;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.repository.InventoryRepository;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.services.InventoryService;
import lombok.RequiredArgsConstructor;
import com.SupplyChainMngmt.com.InventoryService.InventoryService.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryEventPublisher inventoryEventPublisher;

    @Override
    public InventoryItemResponse createOrUpdate(InventoryItemRequest request) {
        InventoryItem item = inventoryRepository
                .findBySkuAndWarehouseId(request.getSku(), request.getWarehouseId())
                .map(existing -> {
                    if (request.getAvailableQty() != null) existing.setAvailableQty(request.getAvailableQty());
                    if (request.getReservedQty() != null) existing.setReservedQty(request.getReservedQty());
                    if (request.getIncomingQty() != null) existing.setIncomingQty(request.getIncomingQty());
                    if (request.getThreshold() != null) existing.setThreshold(request.getThreshold());
                    return existing;
                })
                .orElseGet(() -> InventoryItem.builder()
                        .sku(request.getSku())
                        .warehouseId(request.getWarehouseId())
                        .availableQty(request.getAvailableQty() == null ? 0 : request.getAvailableQty())
                        .reservedQty(request.getReservedQty() == null ? 0 : request.getReservedQty())
                        .incomingQty(request.getIncomingQty() == null ? 0 : request.getIncomingQty())
                        .threshold(request.getThreshold() == null ? 0 : request.getThreshold())
                        .build());

        InventoryItem saved = inventoryRepository.save(item);
        inventoryEventPublisher.publishStockUpdated(saved);

        if(saved.getAvailableQty() != null && saved.getAvailableQty() <= saved.getThreshold()){
            inventoryEventPublisher.publishLowStock(saved);
        }
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryItemResponse getById(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("No inventory found by id: "+id));
        return mapToResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getAll() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getBySku(String sku) {
        return inventoryRepository.findBySku(sku)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryItemResponse getBySkuAndWarehouse(String sku, String warehouseId) {
        InventoryItem items = inventoryRepository.findBySkuAndWarehouseId(sku, warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("No Resource Found with sku: " + sku + " and warehouse id: " + warehouseId));

        return mapToResponse(items);
    }

    @Override
    public InventoryItemResponse adjustStock(Long id, AdjustStockRequest request) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource Not Found with id: "+id));
        int newQty = item.getAvailableQty() + (request.getDelta() == null ? 0: request.getDelta());
        if(newQty<0){
            throw new IllegalArgumentException("Resulting available quantity cannot be negative");
        }

        item.setAvailableQty(newQty);
        InventoryItem saved = inventoryRepository.save(item);

        inventoryEventPublisher.publishStockUpdated(saved);

        if(saved.getAvailableQty() != null && saved.getAvailableQty() <= saved.getThreshold()){
            inventoryEventPublisher.publishLowStock(saved);
        }

        return mapToResponse(saved);
    }

    @Override
    public InventoryItemResponse updateThreshold(Long id, Integer threshold) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: "+id));
        item.setThreshold(threshold);
        InventoryItem saved = inventoryRepository.save(item);

        inventoryEventPublisher.publishLowStock(saved);

        if(saved.getAvailableQty() != null && saved.getAvailableQty() <= saved.getThreshold()){
            inventoryEventPublisher.publishLowStock(saved);
        }

        return mapToResponse(saved);
    }

    @Override
    public void delete(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not fund with id: "+id));
        inventoryRepository.delete(item);
    }

    public InventoryItemResponse mapToResponse(InventoryItem item){
        return InventoryItemResponse.builder()
                .id(item.getId())
                .sku(item.getSku())
                .warehouseId(item.getWarehouseId())
                .availableQty(item.getAvailableQty())
                .reservedQty(item.getReservedQty())
                .incomingQty(item.getIncomingQty())
                .threshold(item.getThreshold())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
