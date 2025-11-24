import React from "react";
import { Bell, User } from "lucide-react";

export default function NavBar() {
  return (
    <header className="w-full h-16 bg-white text-black flex items-center justify-between px-6 shadow-md">
      {/* Left: Dashboard Title */}
      <h1 className="text-lg font-bold">Admin Dashboard</h1>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full hover:bg-primaryHover text-black transition-colors">
          <Bell size={20} />
          {/* Optional: Notification Badge */}
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-200 text-black transition-colors">
          <User size={20} />
          <span className="hidden sm:block">Admin</span>
        </button>
      </div>
    </header>
  );
}
