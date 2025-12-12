package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.repository;

import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.entities.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    List<Shipment> findByOrderId(Long id);
}
