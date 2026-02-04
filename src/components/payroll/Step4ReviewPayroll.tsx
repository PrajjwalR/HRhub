"use client";

import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { WizardEmployee } from "@/app/payroll/wizard/page";
import { createSalarySlip, fetchEmployeeSalarySlips } from "@/lib/frappePayroll";

interface Step4ReviewPayrollProps {
  employees: WizardEmployee[];
  payPeriod: { start: string; end: string };
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  onSlipsGenerated: (slips: any[]) => void;
}

export default function Step4ReviewPayroll({ employees, payPeriod, onNext, onPrevious, onCancel, onSlipsGenerated }: Step4ReviewPayrollProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmployeeSummaryExpanded, setIsEmployeeSummaryExpanded] = useState(false);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
  };

  // Calculate totals
  const totalNetWages = employees.reduce((sum, emp) => sum + emp.totalPay, 0);
  const totalOvertime = employees.reduce((sum, emp) => {
    const hourlyRate = (emp.baseSalary || 0) / 160;
    return sum + (emp.overtime * hourlyRate * 0.5); // Overtime premium only
  }, 0);
  const totalAdditionalEarnings = employees.reduce((sum, emp) => sum + emp.additionalEarnings, 0);
  const totalPayroll = totalNetWages;

  const handleGeneratePayroll = async () => {
    setIsGenerating(true);
    setError(null);

    const results: any[] = [];

    for (const emp of employees) {
      try {
        // Build earnings array for additional earnings
        const earnings: Array<{ salary_component: string; amount: number }> = [];
        
        // Add overtime as an earning component if > 0
        if (emp.overtime > 0) {
          const hourlyRate = (emp.baseSalary || 0) / 160;
          const overtimeAmount = emp.overtime * hourlyRate * 1.5;
          earnings.push({
            salary_component: "Overtime",
            amount: Math.round(overtimeAmount),
          });
        }
        
        // Add additional earnings if > 0
        if (emp.additionalEarnings > 0) {
          earnings.push({
            salary_component: emp.additionalEarningsType || "Bonus",
            amount: emp.additionalEarnings,
          });
        }

        // Try to create a new salary slip with all the details
        const slip = await createSalarySlip({
          employee: emp.id,
          posting_date: new Date().toISOString().split("T")[0],
          start_date: payPeriod.start,
          end_date: payPeriod.end,
          payment_days: Math.round(emp.totalHours / 8), // Convert hours to days
          earnings: earnings.length > 0 ? earnings : undefined,
        });
        results.push({ employee: emp, slip, success: true, isExisting: false });
      } catch (err: any) {
        console.error(`Failed to create slip for ${emp.name}:`, err);

        // If salary slip already exists, try to fetch it
        if (err.message?.includes("already created") || err.message?.includes("409") || err.message?.includes("Salary Slip already exists")) {
          try {
            const existingSlips = await fetchEmployeeSalarySlips(emp.id, payPeriod.start, payPeriod.end);
            if (existingSlips && existingSlips.length > 0) {
              results.push({ employee: emp, slip: existingSlips[0], success: true, isExisting: true });
              continue;
            }
          } catch (fetchErr) {
            console.error(`Failed to fetch existing slip for ${emp.name}:`, fetchErr);
          }
        }
        
        results.push({ employee: emp, error: err.message, success: false });
      }
    }

    onSlipsGenerated(results);
    setIsGenerating(false);
    onNext();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">Review payroll</h2>
        <p className="text-sm text-gray-500">Please spend a brief moment reviewing these numbers before generating salary slips</p>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Left Section */}
        <div className="flex-1">
          {/* Payment Card Section */}
          <div className="bg-gradient-to-r from-[#FFF5E6] to-[#FFF9F0] rounded-2xl p-6 mb-6 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#F5E6D3] rounded-full -mr-8 -mt-8 opacity-50" />
            <div className="absolute right-16 top-0 w-16 h-16 bg-[#2C2C2C] rounded-full -mt-4 opacity-10" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600">Total payroll for {employees.length} employees</span>
              </div>
              
              <h3 className="text-4xl font-bold text-black mb-2">{formatCurrency(totalPayroll)}</h3>
              <p className="text-sm text-gray-500">
                Pay period: {new Date(payPeriod.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(payPeriod.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Detail Payment Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h3 className="text-xl font-bold text-black mb-6">Payment Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total net wages</span>
                <span className="text-lg font-bold text-black">{formatCurrency(totalNetWages)}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total overtime premium</span>
                <span className="text-lg font-bold text-black">{formatCurrency(totalOvertime)}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total additional earnings</span>
                <span className="text-lg font-bold text-black">{formatCurrency(totalAdditionalEarnings)}</span>
              </div>
              
              <div className="flex items-center justify-between py-4">
                <span className="text-base font-medium text-black">Total Payroll</span>
                <span className="text-2xl font-bold text-black">{formatCurrency(totalPayroll)}</span>
              </div>
            </div>
          </div>

          {/* Employee Summary - Collapsible */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <button 
              onClick={() => setIsEmployeeSummaryExpanded(!isEmployeeSummaryExpanded)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-xl font-bold text-black">Employee Summary ({employees.length})</h3>
              {isEmployeeSummaryExpanded ? (
                <ChevronDown size={20} className="text-gray-400" />
              ) : (
                <ChevronRight size={20} className="text-gray-400" />
              )}
            </button>
            {isEmployeeSummaryExpanded && (
              <div className="space-y-3 max-h-64 overflow-y-auto mt-4">
                {employees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${emp.avatarColor} flex items-center justify-center text-white text-xs font-medium`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.totalHours}h + {emp.overtime}h OT</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {/* Bank Details */}
                      {emp.bankName && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{emp.bankName}</p>
                          <p className="text-xs text-gray-400">
                            ****{emp.accountNumber?.slice(-4) || "----"}
                          </p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-black">{formatCurrency(emp.totalPay)}</p>
                        <p className="text-xs text-gray-400">{emp.paymentType}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Illustration */}
        <div className="w-72 flex flex-col items-center justify-start pt-8">
          <div className="bg-gradient-to-br from-[#FFF5E6] to-[#FFF9F0] rounded-2xl p-8 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute right-0 bottom-0 w-20 h-20 bg-[#2C2C2C] rounded-full mr-2 mb-2 opacity-10" />
            
            {/* Document illustration */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-40 bg-white rounded-lg shadow-sm border border-gray-100 mb-4 p-3">
                <div className="w-full h-3 bg-gray-100 rounded mb-2" />
                <div className="w-3/4 h-3 bg-gray-100 rounded mb-4" />
                <div className="w-full h-2 bg-gray-50 rounded mb-1" />
                <div className="w-full h-2 bg-gray-50 rounded mb-1" />
                <div className="w-full h-2 bg-gray-50 rounded mb-1" />
                <div className="w-2/3 h-2 bg-gray-50 rounded" />
              </div>
              
              <h4 className="text-sm font-bold text-black mb-1">Run Payroll Summary</h4>
              <p className="text-xs text-gray-500 text-center">
                {employees.length} employees selected
              </p>
            </div>
          </div>

          {/* Notes Summary */}
          {employees.some(e => e.notes) && (
            <div className="mt-6 w-full bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h4 className="text-sm font-bold text-black mb-2">Notes</h4>
              <div className="space-y-2">
                {employees.filter(e => e.notes).map(emp => (
                  <div key={emp.id} className="text-xs">
                    <span className="font-medium text-black">{emp.name}:</span>
                    <span className="text-gray-600 ml-1">{emp.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
        <button 
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-800"
          disabled={isGenerating}
        >
          Cancel
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            disabled={isGenerating}
          >
            Save as draft
          </button>
          <button 
            onClick={onPrevious}
            className="px-6 py-2 border border-gray-300 text-black text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isGenerating}
          >
            Previous
          </button>
          <button 
            onClick={handleGeneratePayroll}
            disabled={isGenerating}
            className="px-6 py-2 bg-[#F7D046] text-black text-sm font-medium rounded-lg hover:bg-[#E5C03E] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Payroll"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
