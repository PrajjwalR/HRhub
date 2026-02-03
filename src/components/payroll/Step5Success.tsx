"use client";

import { FileText, Calendar, DollarSign, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { WizardEmployee } from "@/app/payroll/wizard/page";

interface Step5SuccessProps {
  employees?: WizardEmployee[];
  generatedSlips?: any[];
  onFinish?: () => void;
}

export default function Step5Success({ employees = [], generatedSlips = [], onFinish }: Step5SuccessProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
  };

  const successfulSlips = generatedSlips.filter(s => s.success);
  const failedSlips = generatedSlips.filter(s => !s.success);
  const existingSlips = generatedSlips.filter(s => s.isExisting);
  const newSlips = generatedSlips.filter(s => s.success && !s.isExisting);

  const totalPayroll = employees.reduce((sum, emp) => sum + emp.totalPay, 0);

  // Calculate breakdown for chart
  const breakdown = {
    baseSalary: employees.reduce((sum, emp) => sum + ((emp.baseSalary || 0) / 12), 0), // Monthly base
    overtime: employees.reduce((sum, emp) => sum + (emp.overtime * ((emp.baseSalary || 0) / 160) * 1.5), 0),
    additionalEarnings: employees.reduce((sum, emp) => sum + emp.additionalEarnings, 0),
  };

  const chartData = [
    { label: "Base Salary", percentage: Math.round((breakdown.baseSalary / totalPayroll) * 100) || 80, color: "#F7D046" },
    { label: "Overtime", percentage: Math.round((breakdown.overtime / totalPayroll) * 100) || 10, color: "#FF9F43" },
    { label: "Additional Earnings", percentage: Math.round((breakdown.additionalEarnings / totalPayroll) * 100) || 10, color: "#26DE81" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-black">Payroll Submitted</h2>
        </div>
        <p className="text-sm text-gray-500">
          Successfully generated {successfulSlips.length} salary slip{successfulSlips.length !== 1 ? 's' : ''} 
          {existingSlips.length > 0 && ` (${existingSlips.length} existing)`}
          {failedSlips.length > 0 && `, ${failedSlips.length} failed`}
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
          <h3 className="text-2xl font-bold text-black mb-1">{successfulSlips.length}</h3>
          <p className="text-xs text-gray-400">Salary Slips Generated</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <Calendar size={20} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-1">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </h3>
          <p className="text-xs text-gray-400">Payroll Date</p>
        </div>
      </div>

      {/* Generated Slips List */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-black">Generated Salary Slips</h3>
          <Link 
            href="/payroll/slips"
            className="text-sm text-[#F7D046] hover:text-[#E5C03E] font-medium"
          >
            View All Slips
          </Link>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {generatedSlips.map((result, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between py-3 px-4 rounded-lg border ${
                result.success ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${result.employee.avatarColor} flex items-center justify-center text-white text-xs font-medium`}>
                  {result.employee.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-black">{result.employee.name}</p>
                    {result.success && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        result.isExisting 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {result.isExisting ? 'Existing' : 'New'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {result.success 
                      ? result.slip?.name || 'Slip generated'
                      : result.error || 'Failed to generate'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {result.success ? (
                  <>
                    <span className="text-sm font-semibold text-black">
                      {formatCurrency(result.employee.totalPay)}
                    </span>
                    {result.slip?.name && (
                      <Link
                        href={`/salary-slip/${encodeURIComponent(result.slip.name)}`}
                        className="p-2 text-gray-400 hover:text-[#F7D046] transition-colors"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    )}
                    <CheckCircle2 size={20} className="text-green-500" />
                  </>
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-xl font-bold text-black">Payroll Breakdown</h3>
          <Link 
            href="/payroll/slips"
            className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            View full report
          </Link>
        </div>

        <div className="flex items-center gap-12">
          {/* Simple Bar Chart */}
          <div className="flex-1">
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-black">{item.label}</span>
                    <span className="text-sm text-gray-500">{item.percentage}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
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

      {/* Action Buttons */}
      <div className="flex items-center justify-end pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/payroll/wizard"
            className="px-6 py-2 border border-gray-300 text-black text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Run New Payroll
          </Link>
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
