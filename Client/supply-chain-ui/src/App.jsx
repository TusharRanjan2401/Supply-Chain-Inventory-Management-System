import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { OrdersPage } from "./pages/OrdersPage";
import { InventoryPage } from "./pages/InventoryPage";
import { ShipmentsPage } from "./pages/ShipmentsPage";
import { NotificationsPage } from "./pages/NotificationsPage";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
