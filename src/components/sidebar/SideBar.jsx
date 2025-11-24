import {
  Home,
  Calendar,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  ClipboardList,
  MessageSquare,
  // Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// inside SideBar component:


export default function SideBar() {
    const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();           // remove token + adminId
    navigate("/login"); // redirect to login
  };
  return (
    <div className="w-64 h-screen bg-primary text-text flex flex-col border-r border-gray-200 shadow-lg">
      {/* Logo / Title */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-text">My SoftTech</h1>
        <p className="text-sm text-text/80 mt-1">Appointment Dashboard</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
        <NavItem label="Customer" icon={Users} to="/dashboard/customers" />
        <NavItem label="Appointment" icon={Calendar} to="/dashboard/appointments" />
        <NavItem label="Service" icon={ClipboardList} to="/dashboard/services" />
        <NavItem label="Order" icon={ShoppingCart} to="/dashboard/orders" />
        <NavItem label="Package" icon={Package} to="/dashboard/packages" />
        <NavItem label="Payment" icon={CreditCard} to="/dashboard/payments" />
        <NavItem label="Reservation" icon={Home} to="/dashboard/reservations" />
        <NavItem label="SMS" icon={MessageSquare} to="/dashboard/sms" />
        {/* <NavItem label="Settings" icon={Settings} to="/dashboard/settings" /> */}
      </nav>

      {/* Bottom Logout */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-3 rounded-lg text-sm font-medium 
                     transition-all duration-200 cursor-pointer text-text hover:bg-primaryHover hover:text-primary"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

function NavItem({ label, icon , to }) {
  
  const Icon = icon;
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium 
        transition-all duration-200 cursor-pointer
        ${
          isActive
            ? "bg-primary text-white shadow-sm"
            : "text-text hover:bg-primaryHover hover:text-primary"
        }
      `
      }
    >
      <Icon size={20} className="flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}
