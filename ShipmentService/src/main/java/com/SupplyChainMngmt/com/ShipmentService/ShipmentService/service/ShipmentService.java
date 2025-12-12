package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.service;

import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request.CreateShipmentRequest;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request.UpdateLocationRequest;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request.UpdateShipmentStatusRequest;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.response.ShipmentResponse;

import java.util.List;

public interface ShipmentService {

    ShipmentResponse createShipment(CreateShipmentRequest request);

    ShipmentResponse getById(Long id);

    List<ShipmentResponse> getAll();

    ShipmentResponse getByTrackingNumber(String trackingNumber);

    List<ShipmentResponse> getByOrderId(Long orderId);

    ShipmentResponse updateStatus(Long id, UpdateShipmentStatusRequest request);

    ShipmentResponse updateLocation(Long id, UpdateLocationRequest request);

    void delete(Long id);
}

