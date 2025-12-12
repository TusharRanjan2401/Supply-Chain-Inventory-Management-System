package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.response;

import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.entities.type.ShipmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ShipmentResponse {
    private Long id;
    private Long orderId;
    private String trackingNumber;
    private String origin;
    private String destination;
    private String currentLocation;
    private ShipmentStatus status;
    private Instant estimatedDelivery;
    private Instant createdAt;
    private Instant updatedAt;
}
