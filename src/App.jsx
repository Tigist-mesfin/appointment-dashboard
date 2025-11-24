import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Registration from "./pages/Registration";
import DashboardLayout from "./pages/DashboardLayout";

import Customer from "./pages/Customer";
import Appointment from "./pages/Appointment";
import Service from "./pages/Service";
import Order from "./pages/Order";
import PackagePage from "./pages/PackagePage";
import Payment from "./pages/Payment";
import Reservation from "./pages/Reservation";
import Sms from "./pages/Sms";

import { AuthContext } from "./context/AuthContext";

export default function App() {
  const { auth } = useContext(AuthContext);
  const isLoggedIn = !!auth?.token;

  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />

      {/* Protected dashboard with nested routes */}
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <DashboardLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Default dashboard page */}
        <Route index element={<Customer />} />

        {/* 8 modules */}
        <Route path="customers" element={<Customer />} />
        <Route path="appointments" element={<Appointment />} />
        <Route path="services" element={<Service />} />
        <Route path="orders" element={<Order />} />
        <Route path="packages" element={<PackagePage />} />
        <Route path="payments" element={<Payment />} />
        <Route path="reservations" element={<Reservation />} />
        <Route path="sms" element={<Sms />} />
      </Route>

      {/* Default route */}
      <Route
        path="*"
        element={
          <Navigate
            to={isLoggedIn ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}
