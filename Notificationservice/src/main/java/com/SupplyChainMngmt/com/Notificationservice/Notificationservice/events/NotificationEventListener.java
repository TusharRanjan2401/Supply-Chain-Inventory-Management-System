package com.SupplyChainMngmt.com.Notificationservice.Notificationservice.events;

import com.SupplyChainMngmt.com.Notificationservice.Notificationservice.services.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Value("${app.topics.order-events}")
    private String orderEventsTopic;

    @Value("${app.topics.inventory-events}")
    private String inventoryEventsTopic;

    @Value("${app.topics.shipment-events}")
    private String shipmentEventsTopic;

    @KafkaListener(topics = "${app.topics.order-events}",
            groupId = "${spring.kafka.consumer.group-id}")
    public void onOrderEvent(@Payload String message){
        log.info("Received Order event from {}: {}", orderEventsTopic, message);
        String eventType = extractEventType(message);
        notificationService.handleOrderEvent(eventType, message);
    }

    @KafkaListener(topics = "${app.topics.inventory-events}",
            groupId = "${spring.kafka.consumer.group-id}")
    public void onInventoryEvent(@Payload String message){
        log.info("Received Inventory event from {}: {}", inventoryEventsTopic, message);
        String eventType = extractEventType(message);
        notificationService.handleInventoryEvent(eventType,message);
    }

    @KafkaListener(topics = "${app.topics.shipment-events}",
            groupId = "${spring.kafka.consumer.group-id}")
    public void onShipmentEvent(@Payload String message){
        log.info("Received Shipment from {}: {}", shipmentEventsTopic, message);
        String eventType = extractEventType(message);
        notificationService.handleShipmentEvent(eventType, message);
    }

    private String extractEventType(String json) {
        try {
            JsonNode node = objectMapper.readTree(json);
            log.info("Root JSON node type: {}", node.getNodeType());
            if (node.isTextual()) {
                String inner = node.asText();
                log.info("Detected textual JSON, inner value: {}", inner); // DEBUG
                node = objectMapper.readTree(inner);
            }

            if (node.has("eventType")) {
                String type = node.get("eventType").asText();
                log.info("Extracted eventType: {}", type); // DEBUG
                return type;
            } else {
                log.warn("JSON node has no 'eventType' field. Payload: {}", node.toString());
            }
        } catch (Exception e) {
            log.warn("Failed to parse eventType from payload: {}", json, e);
        }
        return "UNKNOWN_EVENT";
    }

}
