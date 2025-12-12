package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.events;

import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.entities.Shipment;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ShipmentEventPublisher {

    private final KafkaTemplate<String, ShipmentEvent> kafkaTemplate;

    @Value("${app.topics.shipment-events:shipment.events}")
    private String shipmentEventsTopics;

    public void publishShipmentCreated(Shipment shipment){
        ShipmentEvent event = baseEvent(shipment).toBuilder()
                .eventType("SHIPMENT_CREATED")
                .build();

        kafkaTemplate.send(shipmentEventsTopics, shipment.getTrackingNumber(), event);
    }

    public void publishShipmentStatusUpdated(Shipment shipment){
        ShipmentEvent event = baseEvent(shipment).toBuilder()
                .eventType("SHIPMENT_STATUS_UPDATED")
                .build();

        kafkaTemplate.send(shipmentEventsTopics, shipment.getTrackingNumber(), event);
    }

    public void publishShipmentLocationUpdated(Shipment shipment){
        ShipmentEvent event = baseEvent(shipment).toBuilder()
                .eventType("SHIPMENT_LOCATION_UPDATED")
                .build();
        kafkaTemplate.send(shipmentEventsTopics, shipment.getTrackingNumber(), event);
    }

    private ShipmentEvent baseEvent(Shipment shipment){
        return ShipmentEvent.builder()
                .shipmentId(shipment.getId())
                .orderId(shipment.getOrderId())
                .trackingNumber(shipment.getTrackingNumber())
                .origin(shipment.getOrigin())
                .destination(shipment.getDestination())
                .status(shipment.getStatus())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                .eventTime(Instant.now())
                .build();
    }
}
