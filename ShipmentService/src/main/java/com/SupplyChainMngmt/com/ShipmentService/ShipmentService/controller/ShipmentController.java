package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.controller;

import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request.CreateShipmentRequest;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request.UpdateLocationRequest;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request.UpdateShipmentStatusRequest;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.response.ShipmentResponse;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.exception.payload.ApiResponse;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipment")
@RequiredArgsConstructor
public class ShipmentController {
    private final ShipmentService shipmentService;

    @PostMapping
    public ResponseEntity<ShipmentResponse> createShipment(@RequestBody CreateShipmentRequest request){
        ShipmentResponse response = shipmentService.createShipment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> getAllShipment(){
        List<ShipmentResponse> shipmentResponseList = shipmentService.getAll();
        return ResponseEntity.ok(shipmentResponseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getShipmentById(@PathVariable Long id){
        ShipmentResponse response = shipmentService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<ShipmentResponse>> getShipmentByOrderId(@PathVariable Long orderId){
        List<ShipmentResponse> shipmentResponseList = shipmentService.getByOrderId(orderId);
        return ResponseEntity.ok(shipmentResponseList);
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShipmentResponse> getShipmentByTrackingNumber(@PathVariable String trackingNumber){
        ShipmentResponse response = shipmentService.getByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ShipmentResponse> updateStatusHandler(@PathVariable Long id, @RequestBody UpdateShipmentStatusRequest request){
        ShipmentResponse response = shipmentService.updateStatus(id,request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/location")
    public ResponseEntity<ShipmentResponse> updateLocationHandler(@PathVariable Long id, @RequestBody UpdateLocationRequest request){
        ShipmentResponse response = shipmentService.updateLocation(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ShipmentResponse> deleteShipmentById(@PathVariable Long id){
        shipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
