package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.events;

import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.entities.type.ShipmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder(toBuilder = true)
public class ShipmentEvent {
    private String eventType;

    private Long shipmentId;
    private Long orderId;
    private String trackingNumber;
    private String origin;
    private String destination;
    private String currentLocation;
    private ShipmentStatus status;
    private Instant estimatedDelivery;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant eventTime;
}
