"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  icon: LucideIcon;
  href: string;
  label: string;
  isExpanded: boolean;
  onCollapse: () => void;
}

export default function SidebarItem({ icon: Icon, href, label, isExpanded, onCollapse }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onCollapse}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative ${
        isActive
          ? "bg-[#F7D046] text-[#2C2C2C]"
          : "text-gray-800 hover:text-black hover:bg-gray-100"
      } ${isExpanded ? "justify-start" : "justify-center"}`}
    >
      <Icon size={24} strokeWidth={2} className="flex-shrink-0" />
      {isExpanded && (
        <span className="font-medium text-sm whitespace-nowrap">{label}</span>
      )}
      {isActive && !isExpanded && (
        <div className="absolute left-0 w-1 h-6 bg-[#F7D046] rounded-r-full -ml-3" />
      )}
    </Link>
  );
}
