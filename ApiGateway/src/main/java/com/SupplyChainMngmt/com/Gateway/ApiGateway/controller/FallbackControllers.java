package com.SupplyChainMngmt.com.Gateway.ApiGateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FallbackControllers {

    @RequestMapping("/fallback/order")
    public ResponseEntity<String> orderFallback() {
        return ResponseEntity.ok("Order service is currently unavailable. Please try again later.");
    }

    @RequestMapping("/fallback/inventory")
    public ResponseEntity<String> inventoryFallback() {
        return ResponseEntity.ok("Inventory service is currently unavailable. Please try again later.");
    }

    @RequestMapping("/fallback/shipment")
    public ResponseEntity<String> shipmentFallback() {
        return ResponseEntity.ok("Shipment service is currently unavailable. Please try again later.");
    }

    @RequestMapping("/fallback/notification")
    public ResponseEntity<String> notificationFallback() {
        return ResponseEntity.ok("Notification service is currently unavailable. Please try again later.");
    }

    @RequestMapping("/fallback/email")
    public ResponseEntity<String> emailFallback() {
        return ResponseEntity.ok("Email service is currently unavailable. Please try again later.");
    }
}
