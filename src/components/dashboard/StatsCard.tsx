import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  value: string;
  label: string;
  change?: string;
  changeType?: "positive" | "negative";
}

export default function StatsCard({ 
  icon: Icon, 
  iconColor, 
  iconBgColor, 
  value, 
  label, 
  change, 
  changeType 
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-md p-3 py-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex-1">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-6 h-6 rounded-md ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon size={12} className={iconColor} strokeWidth={2} />
        </div>
        {change && (
          <div className={`text-[8px] font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-base font-bold text-[#2C2C2C] font-sans leading-tight">{value}</h3>
        <p className="text-[9px] text-gray-500 font-sans mt-1">{label}</p>
      </div>
    </div>
  );
}
