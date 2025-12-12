package com.SupplyChainMngmt.com.InventoryService.InventoryService.exceptions;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
