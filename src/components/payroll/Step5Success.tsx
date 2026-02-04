"use client";

import { FileText, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { WizardEmployee } from "@/app/payroll/wizard/page";

interface Step5SuccessProps {
  employees?: WizardEmployee[];
  generatedSlips?: any[];
  onFinish?: () => void;
  onPrevious?: () => void;
}

interface ChartDataItem {
  label: string;
  percentage: number;
  amount: number;
  color: string;
}

export default function Step5Success({ employees = [], generatedSlips = [], onFinish, onPrevious }: Step5SuccessProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
  };

  // Calculate real totals from employee data
  const totalPayroll = employees.reduce((sum, emp) => sum + emp.totalPay, 0);
  
  // Calculate breakdown amounts from real employee data
  const baseSalaryTotal = employees.reduce((sum, emp) => {
    const monthlyBase = (emp.baseSalary || 0) / 12;
    const hourlyRate = (emp.baseSalary || 0) / (160 * 12);
    return sum + (emp.totalHours * hourlyRate * 12); // Approximate base portion
  }, 0);

  const overtimeTotal = employees.reduce((sum, emp) => {
    const hourlyRate = (emp.baseSalary || 0) / (160 * 12);
    return sum + (emp.overtime * hourlyRate * 1.5 * 12);
  }, 0);

  const additionalEarningsTotal = employees.reduce((sum, emp) => sum + emp.additionalEarnings, 0);

  const paidTimeOffTotal = employees.reduce((sum, emp) => {
    const hourlyRate = (emp.baseSalary || 0) / (160 * 12);
    return sum + (emp.paidTimeOff * hourlyRate);
  }, 0);

  const paidHolidayTotal = employees.reduce((sum, emp) => {
    const hourlyRate = (emp.baseSalary || 0) / (160 * 12);
    return sum + (emp.paidHoliday * hourlyRate);
  }, 0);

  const sickLeaveTotal = employees.reduce((sum, emp) => {
    const hourlyRate = (emp.baseSalary || 0) / (160 * 12);
    return sum + (emp.sickLeave * hourlyRate);
  }, 0);

  // Calculate percentages based on total payroll
  const calculatePercentage = (amount: number): number => {
    if (totalPayroll === 0) return 0;
    return Math.round((amount / totalPayroll) * 100);
  };

  // Build chart data from real values
  const chartData: ChartDataItem[] = [
    { 
      label: "Base Salary", 
      amount: totalPayroll - overtimeTotal - additionalEarningsTotal - paidTimeOffTotal - paidHolidayTotal - sickLeaveTotal,
      percentage: 0, // Will calculate
      color: "#F7D046" 
    },
    { label: "Overtime", amount: overtimeTotal, percentage: 0, color: "#FF9F43" },
    { label: "Additional Earnings", amount: additionalEarningsTotal, percentage: 0, color: "#54A0FF" },
    { label: "Paid Time Off", amount: paidTimeOffTotal, percentage: 0, color: "#A29BFE" },
    { label: "Paid Holiday", amount: paidHolidayTotal, percentage: 0, color: "#26DE81" },
    { label: "Sick Leave", amount: sickLeaveTotal, percentage: 0, color: "#FD79A8" },
  ];

  // Calculate percentages
  chartData.forEach(item => {
    item.percentage = calculatePercentage(item.amount);
  });

  // Make sure base salary gets the remainder
  const otherPercentages = chartData.slice(1).reduce((sum, item) => sum + item.percentage, 0);
  chartData[0].percentage = Math.max(0, 100 - otherPercentages);

  // Filter out items with 0 percentage for the chart (but keep for display)
  const chartDataForDisplay = chartData;
  const chartDataForDonut = chartData.filter(item => item.percentage > 0);

  // Calculate the SVG segments for the donut chart
  const total = chartDataForDonut.reduce((sum, item) => sum + item.percentage, 0) || 1;
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
        <h2 className="text-2xl font-bold text-black mb-2">Payroll Submitted</h2>
        <p className="text-sm text-gray-500">
          Paie will debit {formatCurrency(totalPayroll)} on July 30, and {employees.length} employee{employees.length !== 1 ? 's' : ''} will be paid at 1 Aug, make sure the funds available
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-1">{formatCurrency(totalPayroll)}</h3>
          <p className="text-xs text-gray-400">Total Payroll</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <FileText size={20} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-1">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </h3>
          <p className="text-xs text-gray-400">Payroll Draft Date</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <Calendar size={20} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-1">
            {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </h3>
          <p className="text-xs text-gray-400">Payroll payment date</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-xl font-bold text-black">What Your Company Pays</h3>
          <button className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            View full report
          </button>
        </div>

        <div className="flex items-center gap-12">
          {/* Donut Chart */}
          <div className="relative w-48 h-48 flex-shrink-0">
            {chartDataForDonut.length > 0 ? (
              <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
                {chartDataForDonut.map((item, index) => {
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
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No data
              </div>
            )}
            {/* Reset cumulative for next render */}
            <span className="hidden">{cumulativePercentage = 0}</span>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 flex-1">
            {chartDataForDisplay.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-black font-medium">{item.label}</span>
                <span className="text-sm text-gray-400">{item.percentage}%</span>
              </div>
            ))}
          </div>

          {/* Illustration */}
          <div className="flex-shrink-0">
            <div className="w-36 h-36 bg-gradient-to-br from-[#FFF5E6] to-[#FFF9F0] rounded-2xl flex items-center justify-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute right-0 bottom-0 w-16 h-16 bg-[#2C2C2C] rounded-full mr-1 mb-1 opacity-10" />
              
              {/* Document with checkmark illustration */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-20 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-green-500 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                {/* Paper airplane decoration */}
                <div className="absolute -top-2 -right-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2C2C" strokeWidth="1.5" className="opacity-40">
                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
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
          <button 
            onClick={onPrevious}
            className="px-6 py-2.5 border border-gray-300 text-black text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <Link 
            href="/payroll"
            className="px-6 py-2.5 bg-[#F7D046] text-black text-sm font-medium rounded-lg hover:bg-[#E5C03E] transition-colors"
          >
            Finish Payroll
          </Link>
        </div>
      </div>
    </div>
  );
}
