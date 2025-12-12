package com.SupplyChainMngmt.com.Notificationservice.Notificationservice.services;

import com.SupplyChainMngmt.com.Notificationservice.Notificationservice.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcast(NotificationEvent event) {
        messagingTemplate.convertAndSend("/topic/notifications", event);
    }
}
