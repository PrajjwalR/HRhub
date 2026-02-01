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
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  const navItems = [
    { icon: LayoutGrid, href: "/dashboard", label: "Dashboard" },
    { icon: Wallet, href: "/payroll", label: "Payroll" },
    { icon: CircleDollarSign, href: "/salary", label: "Expenses" },
    { icon: Star, href: "/favorites", label: "Benefit" },
    { icon: CalendarDays, href: "/time-attendance", label: "Time & Attendance" },
    { icon: FileText, href: "/documents", label: "Company" },
    { icon: Tag, href: "/tags", label: "Tax & Compilance" },
    { icon: Users, href: "/team", label: "Integrations" },
    { icon: Settings, href: "/settings", label: "Settings" },
  ];

  return (
    <aside 
      ref={sidebarRef}
      className={`min-h-screen border-r border-gray-100 flex flex-col items-start py-8 bg-white fixed left-0 top-0 z-50 transition-all duration-300 ${
        isExpanded ? "w-64 px-6" : "w-20 px-0 items-center"
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
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-2 w-full">
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
      <div className={`mt-10 ${isExpanded ? "w-full" : "w-full flex justify-center"}`}>
        <a href="/profile" className={`flex items-center gap-3 ${isExpanded ? "p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" : ""}`}>
          <div className="w-12 h-12 rounded-full bg-[#E5EDFF] flex items-center justify-center text-[#4A72FF] font-semibold text-sm cursor-pointer border-2 border-white shadow-sm flex-shrink-0">
            JD
          </div>
          {isExpanded && (
            <div className="flex-1">
              <p className="font-bold text-[#2C2C2C] text-sm">John Doe</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          )}
        </a>
      </div>
    </aside>
  );
}
