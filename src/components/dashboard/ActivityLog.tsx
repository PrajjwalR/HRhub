"use client";

import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  amount?: string;
  status: "completed" | "pending" | "info";
}

export default function ActivityLog() {
  const activities: ActivityItem[] = [
    {
      id: "1",
      timestamp: "Jun 09th 13:15",
      user: "John Doe",
      action: "set Emily's Anderson salary rate to ₹3,000",
      status: "completed"
    },
    {
      id: "2",
      timestamp: "Jun 09th 09:15",
      user: "Manager John Doe",
      action: "run payroll for Jun 01st - 30th",
      status: "completed"
    },
    {
      id: "3",
      timestamp: "Jun 08th 20:48",
      user: "Mike Poe and Steve Fawcik",
      action: "edited policy to ₹2,000k",
      status: "info"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-600" />;
      case "pending":
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return <AlertCircle size={16} className="text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-xl font-bold text-[#2C2C2C] font-sans mb-6">Activity log</h2>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0">
            <div className="mt-1">{getStatusIcon(activity.status)}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm text-[#2C2C2C] font-sans">
                  <span className="font-semibold">{activity.user}</span> {activity.action}
                </p>
              </div>
              <p className="text-xs text-gray-400 font-sans">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500 font-sans">
          <span>8 Sep 2022</span>
          <span>•</span>
          <span>Account term of use</span>
          <span>•</span>
          <span>General term of service</span>
          <span>•</span>
          <span>Cookie Policy</span>
        </div>
      </div>
    </div>
  );
}
