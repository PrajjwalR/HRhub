"use client";

import { FileText, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

interface Step5SuccessProps {
  onFinish: () => void;
}

const chartData = [
  { label: "Salary", percentage: 80, color: "#F7D046" },
  { label: "Bonus", percentage: 5, color: "#FF9F43" },
  { label: "Commision", percentage: 2, color: "#54A0FF" },
  { label: "Company taxes", percentage: 5, color: "#FF6B6B" },
  { label: "Paid Time Off", percentage: 4, color: "#A29BFE" },
  { label: "Reimbursement", percentage: 5, color: "#26DE81" },
  { label: "Overtime", percentage: 2, color: "#FD79A8" },
  { label: "Benefits", percentage: 5, color: "#00D2D3" },
];

export default function Step5Success({ onFinish }: Step5SuccessProps) {
  // Calculate the SVG segments for the donut chart
  const total = chartData.reduce((sum, item) => sum + item.percentage, 0);
  let cumulativePercentage = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2C2C2C] mb-1">Payroll Submitted</h2>
        <p className="text-sm text-gray-500">Paie will debit 12,607.09 on July 30, and 22 employee will be paid at 1 Aug, make sure the funds available</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-[#2C2C2C] mb-1">$12,607.09</h3>
          <p className="text-xs text-gray-400">Total Payroll</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <FileText size={20} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-[#2C2C2C] mb-1">Jul 29 2022</h3>
          <p className="text-xs text-gray-400">Payroll Draft Date</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <Calendar size={20} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-[#2C2C2C] mb-1">Aug 1, 2022</h3>
          <p className="text-xs text-gray-400">Payroll payment date</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-xl font-bold text-[#2C2C2C]">What Your Company Pays</h3>
          <button className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            View full report
          </button>
        </div>

        <div className="flex items-center gap-12">
          {/* Donut Chart */}
          <div className="relative w-48 h-48">
            <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
              {chartData.map((item, index) => {
                const startPercent = cumulativePercentage / total;
                cumulativePercentage += item.percentage;
                const endPercent = cumulativePercentage / total;
                
                const [startX, startY] = getCoordinatesForPercent(startPercent);
                const [endX, endY] = getCoordinatesForPercent(endPercent);
                
                const largeArcFlag = item.percentage / total > 0.5 ? 1 : 0;
                
                const pathData = [
                  `M ${startX} ${startY}`,
                  `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="0.35"
                  />
                );
              })}
            </svg>
            {/* Reset cumulative for next render */}
            <span className="hidden">{cumulativePercentage = 0}</span>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[#2C2C2C] font-medium">{item.label}</span>
                <span className="text-sm text-gray-400">{item.percentage}%</span>
              </div>
            ))}
          </div>

          {/* Illustration */}
          <div className="ml-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-[#FFF5E6] to-[#FFF9F0] rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-12 h-12 bg-[#2C2C2C] rounded-full mr-1 mb-1 opacity-10" />
              <div className="w-16 h-20 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-green-500 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button className="px-6 py-2 border border-gray-300 text-[#2C2C2C] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Rerun Payroll
          </button>
          <Link 
            href="/payroll"
            className="px-6 py-2 bg-[#2C2C2C] text-white text-sm font-medium rounded-lg hover:bg-[#1C1C1C] transition-colors"
          >
            Finish Payroll
          </Link>
        </div>
      </div>
    </div>
  );
}
