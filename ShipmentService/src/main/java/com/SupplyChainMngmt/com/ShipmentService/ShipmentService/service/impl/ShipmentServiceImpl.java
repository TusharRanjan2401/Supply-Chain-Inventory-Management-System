package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.service.impl;

import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request.CreateShipmentRequest;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request.UpdateLocationRequest;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request.UpdateShipmentStatusRequest;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.response.ShipmentResponse;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.entities.Shipment;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.entities.type.ShipmentStatus;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.events.ShipmentEventPublisher;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.exception.ResourceNotFoundException;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.repository.ShipmentRepository;
import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventPublisher shipmentEventPublisher;

    @Override
    public ShipmentResponse createShipment(CreateShipmentRequest request) {
        Shipment shipment = Shipment.builder()
                .orderId(request.getOrderId())
                .trackingNumber(request.getTrackingNumber())
                .origin(request.getOrigin())
                .destination(request.getDestination())
                .currentLocation(request.getOrigin())
                .status(ShipmentStatus.CREATED)
                .estimatedDelivery(request.getEstimatedDelivery())
                .build();
        Shipment saved = shipmentRepository.save(shipment);

        shipmentEventPublisher.publishShipmentCreated(saved);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentResponse getById(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource Not Found with id: "+id));
        return mapToResponse(shipment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAll() {
        return shipmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentResponse getByTrackingNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with tracking number: "+trackingNumber));
        return mapToResponse(shipment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShipmentResponse> getByOrderId(Long orderId) {
        return shipmentRepository.findByOrderId(orderId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ShipmentResponse updateStatus(Long id, UpdateShipmentStatusRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: "+id));
        shipment.setStatus(request.getStatus());
        Shipment saved = shipmentRepository.save(shipment);

        shipmentEventPublisher.publishShipmentStatusUpdated(saved);

        return mapToResponse(saved);
    }

    @Override
    public ShipmentResponse updateLocation(Long id, UpdateLocationRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Resource not found with id: "+id));
        shipment.setCurrentLocation(request.getCurrentLocation());
        Shipment saved = shipmentRepository.save(shipment);

        shipmentEventPublisher.publishShipmentLocationUpdated(saved);

        return mapToResponse(saved);
    }

    @Override
    public void delete(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: "+id));
        shipmentRepository.delete(shipment);
    }

    public ShipmentResponse mapToResponse(Shipment shipment){
        return ShipmentResponse.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrderId())
                .trackingNumber(shipment.getTrackingNumber())
                .origin(shipment.getOrigin())
                .destination(shipment.getDestination())
                .currentLocation(shipment.getCurrentLocation())
                .status(shipment.getStatus())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                .build();
    }
}
