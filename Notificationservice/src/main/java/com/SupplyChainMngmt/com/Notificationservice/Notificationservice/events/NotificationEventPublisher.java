package com.SupplyChainMngmt.com.Notificationservice.Notificationservice.events;

import com.SupplyChainMngmt.com.Notificationservice.Notificationservice.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEventPublisher {

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Value("${app.topics.notification-email-events}")
    private
    String emailNotificationTopic;

    public void publish(NotificationEvent event) {
        log.info("📤 Publishing notification event to topic {}: {}", emailNotificationTopic, event);
        kafkaTemplate.send(emailNotificationTopic, event.getNotificationId(), event);
    }
}
