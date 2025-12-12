package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request;

import lombok.Data;

import java.time.Instant;

@Data
public class CreateShipmentRequest {
    private Long orderId;
    private String trackingNumber;
    private String origin;
    private String destination;
    private Instant estimatedDelivery;
}
