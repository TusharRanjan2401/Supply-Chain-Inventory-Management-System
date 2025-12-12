package com.SupplyChainMngmt.com.EmailService.EmailService.events;

import com.SupplyChainMngmt.com.EmailService.EmailService.dto.NotificationEvent;
import com.SupplyChainMngmt.com.EmailService.EmailService.service.EmailSenderService;
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
public class NotificationEmailEventListener {

    private final EmailSenderService emailSenderService;
    private final ObjectMapper objectMapper;

    @Value("${app.topics.notification-email-events}")
    private String emailNotificationTopic;

    @KafkaListener(
            topics = "${app.topics.notification-email-events}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void onNotificationEvent(@Payload String message) {
        log.info("Received NotificationEvent from topic {}: {}", emailNotificationTopic, message);

        try {
            NotificationEvent event = objectMapper.readValue(message, NotificationEvent.class);
            emailSenderService.sendNotificationEmail(event);
        } catch (Exception e) {
            log.error("Failed to parse NotificationEvent JSON: {}", message, e);
        }
    }

}
