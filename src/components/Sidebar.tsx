"use client";

import { 
  LayoutGrid, 
  Wallet, 
  CircleDollarSign, 
  Star, 
  CalendarDays, 
  FileText, 
  Tag, 
  Users, 
  UserPlus,
  Settings,
  Menu,
  X,
  CalendarCheck,
  TrendingUp,
  Package,
  ShieldCheck,
  Building2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isExpanded) {
        setIsExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const allNavItems = [
    { icon: LayoutGrid, href: "/dashboard", label: "Dashboard", roles: ["admin", "employee"] },
    { icon: Wallet, href: "/payroll", label: "Payroll", roles: ["admin"] },
    { icon: FileText, href: "/my-payslips", label: "My Payslips", roles: ["employee"] },
    { icon: CircleDollarSign, href: "/expenses", label: "Expenses", roles: ["admin", "employee"] },
    { icon: UserPlus, href: "/recruitment-onboarding", label: "Recruitment & Onboarding", roles: ["admin", "employee"] },
    { icon: Package, href: "/assets", label: "Assets Management", roles: ["admin", "employee"] },
    { icon: CalendarDays, href: "/time-attendance", label: "Time & Attendance", roles: ["admin", "employee"] },
    { icon: CalendarCheck, href: "/leaves", label: "Leaves", roles: ["admin", "employee"] },
    { icon: TrendingUp, href: "/performance", label: "Performance", roles: ["admin", "employee"] },
    { icon: Building2, href: "/company", label: "Company", roles: ["admin", "employee"] },
    { icon: ShieldCheck, href: "/tax-compliance", label: "Tax & Compliance", roles: ["admin"] },
    { icon: Users, href: "/team", label: "Integrations", roles: ["admin"] },
    { icon: Settings, href: "/settings", label: "Settings", roles: ["admin"] },
  ];

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  // Don't render sidebar on login page (AFTER all hooks)
  if (pathname === "/login") {
    return null;
  }

  return (
    <aside 
      ref={sidebarRef}
      className={`h-screen border-r border-gray-100 flex flex-col items-start py-8 bg-white fixed left-0 top-0 z-50 transition-all duration-300 shadow-sm ${
        isExpanded ? "w-72 px-6" : "w-20 px-0 items-center"
      }`}
    >
      {/* Logo - Always Centered */}
      <div className={`w-full flex ${isExpanded ? "justify-start px-3" : "justify-center"} mb-6`}>
        <div className="cursor-pointer flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF8C42] flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-bold text-2xl font-serif">H</span>
          </div>
          {isExpanded && (
            <span className="text-xl font-bold text-[#2C2C2C] font-serif">HRhub</span>
          )}
        </div>
      </div>

      {/* Toggle Button - Separate Row */}
      <div className={`w-full flex ${isExpanded ? "justify-end px-3" : "justify-center"} mb-8`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-black"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-2 w-full overflow-y-auto no-scrollbar pb-4">
        {navItems.map((item, index) => (
          <SidebarItem 
            key={index} 
            icon={item.icon} 
            href={item.href}
            label={item.label}
            isExpanded={isExpanded}
            onCollapse={() => setIsExpanded(false)}
          />
        ))}
      </div>

      {/* User Profile */}
      <div className={`mt-auto w-full relative border-t border-gray-100 pt-4 bg-white`}>
        <div className={isExpanded ? "w-full" : "flex justify-center"}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-3 ${isExpanded ? "p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" : "justify-center cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-colors"}`}
          >
            <div className="w-10 h-10 rounded-full bg-[#E5EDFF] flex items-center justify-center text-[#4A72FF] font-semibold text-xs border-2 border-white shadow-sm flex-shrink-0">
              {user?.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "JD"}
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#2C2C2C] text-sm truncate">{user?.name || "John Doe"}</p>
                <p className="text-gray-400 text-xs capitalize truncate">{user?.role || "Administrator"}</p>
              </div>
            )}
          </div>
          
          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className={`absolute ${isExpanded ? "bottom-full left-0 right-0 mb-4 mx-2" : "bottom-0 left-full ml-4 mb-0"} bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 min-w-[220px]`}>
              <div className="px-4 py-3 border-b border-gray-50 mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                <p className="text-sm font-bold text-[#2C2C2C] truncate">{user?.email}</p>
              </div>
              
              <a 
                href="/profile" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#4A72FF] transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <Users size={16} />
                View Profile
              </a>
              <a 
                href="/my-payslips" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#4A72FF] transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <FileText size={16} />
                My Payslips
              </a>
              <div className="border-t border-gray-50 my-2"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
