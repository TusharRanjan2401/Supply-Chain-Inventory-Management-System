package com.SupplyChainMngmt.com.Notificationservice.Notificationservice.services;

import com.SupplyChainMngmt.com.Notificationservice.Notificationservice.dto.NotificationEvent;
import com.SupplyChainMngmt.com.Notificationservice.Notificationservice.events.NotificationEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationEventPublisher publisher;
    private final NotificationWebSocketService wsService;

    private static final String DEFAULT_CUSTOMER_EMAIL = "customer@gmail.com";
    private static final String DEFAULT_WAREHOUSE_EMAIL = "warehuse@gmail.com";

    public void handleOrderEvent(String eventType, String rawPayload){
        NotificationEvent event = NotificationEvent.builder()
                .notificationId(UUID.randomUUID().toString())
                .userEmail(DEFAULT_CUSTOMER_EMAIL)
                .message("Order event: "+rawPayload)
                .type(eventType)
                .timestamp(Instant.now())
                .build();

        publisher.publish(event);
        wsService.broadcast(event);
    }

    public  void handleInventoryEvent(String eventType, String rawPayload){
        NotificationEvent event = NotificationEvent.builder()
                .notificationId(UUID.randomUUID().toString())
                .userEmail(DEFAULT_WAREHOUSE_EMAIL)
                .message("Inventory event: "+ rawPayload)
                .type(eventType)
                .timestamp(Instant.now())
                .build();

        publisher.publish(event);
        wsService.broadcast(event);
    }

    public void handleShipmentEvent(String eventType, String rawPayload){
        NotificationEvent event = NotificationEvent.builder()
                .notificationId(UUID.randomUUID().toString())
                .userEmail(DEFAULT_CUSTOMER_EMAIL)
                .message("Shipment event: "+rawPayload)
                .type(eventType)
                .timestamp(Instant.now())
                .build();

        publisher.publish(event);
        wsService.broadcast(event);
    }
}
