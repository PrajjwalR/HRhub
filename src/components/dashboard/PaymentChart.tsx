"use client";

import { MoreVertical } from "lucide-react";

export default function PaymentChart() {
  const months = ["Jan 2022", "Mar 2022", "Apr 2022", "May 2022", "Jun 2022", "Jul 2022"];
  
  // Sample data - salary and other costs per month
  const data = [
    { salary: 18, other: 6 },
    { salary: 24, other: 8 },
    { salary: 32, other: 15 },
    { salary: 19, other: 8 },
    { salary: 23, other: 10 },
    { salary: 37, other: 13 },
  ];

  const maxValue = 50;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#2C2C2C] font-sans">Company payments overview</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
            Export
          </button>
          <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
            <MoreVertical size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content: Chart on Left, Legend on Right */}
      <div className="flex gap-6 flex-1">
        {/* Chart */}
        <div className="flex-1 flex items-end justify-between gap-3 h-48">
          {data.map((item, index) => {
            const totalHeight = ((item.salary + item.other) / maxValue) * 100;
            const salaryHeight = (item.salary / (item.salary + item.other)) * 100;
            const otherHeight = (item.other / (item.salary + item.other)) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex flex-col justify-end" style={{ height: `${totalHeight}%` }}>
                  <div 
                    className="w-full bg-[#2C2C2C] rounded-t-lg"
                    style={{ height: `${otherHeight}%` }}
                  />
                  <div 
                    className="w-full bg-[#F7D046]"
                    style={{ height: `${salaryHeight}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-sans">{months[index]}</span>
              </div>
            );
          })}
        </div>

        {/* Legend on Right */}
        <div className="flex flex-col justify-center space-y-4 min-w-[140px]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 bg-[#2C2C2C] rounded-sm" />
              <span className="text-xs text-gray-500 font-sans">Total cost</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#2C2C2C] font-sans">₹37K</span>
              <span className="text-xs text-green-600 font-medium">+4.5%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 bg-[#F7D046] rounded-sm" />
              <span className="text-xs text-gray-500 font-sans">Salary</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#2C2C2C] font-sans">₹25K</span>
              <span className="text-xs text-green-600 font-medium">+6.5%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 bg-gray-300 rounded-sm" />
              <span className="text-xs text-gray-500 font-sans">Other</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#2C2C2C] font-sans">₹15K</span>
              <span className="text-xs text-red-600 font-medium">+6.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
