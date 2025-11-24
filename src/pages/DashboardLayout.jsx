// src/pages/DashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/sidebar/SideBar";
import NavBar from "../components/navbar/NavBar";

export default function DashboardLayout() {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Fixed Sidebar */}
      <SideBar />

      {/* Main content shifted to the right of sidebar */}
      <div className="flex-1 flex flex-col">
        {/* Top Nav (optional: can make this sticky too) */}
        <NavBar />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
