"use client";

import { ChevronDown } from "lucide-react";

interface Step4ReviewPayrollProps {
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
}

export default function Step4ReviewPayroll({ onNext, onPrevious, onCancel }: Step4ReviewPayrollProps) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2C2C2C] mb-1">Review payroll</h2>
        <p className="text-sm text-gray-500">Please spend a brief moment reviewing this numberurs, time off and aadtional earning</p>
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
                <span className="text-sm text-gray-600">Paié will debit from your</span>
                <button className="flex items-center gap-1 text-sm font-medium text-[#2C2C2C]">
                  Master card
                  <ChevronDown size={14} />
                </button>
              </div>
              
              <h3 className="text-4xl font-bold text-[#2C2C2C] mb-2">$111,607.09</h3>
              <p className="text-sm text-gray-500">On July 30th, and 22 employee will be paid at 1st Aug</p>
            </div>
          </div>

          {/* Detail Payment Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-[#2C2C2C] mb-6">Detail Payment</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total net wages</span>
                <span className="text-lg font-bold text-[#2C2C2C]">$110,607.09</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total Company taxes</span>
                <span className="text-lg font-bold text-[#2C2C2C]">$1,607.09</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total Reimbursement</span>
                <span className="text-lg font-bold text-[#2C2C2C]">$0</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total Company Benefit</span>
                <span className="text-lg font-bold text-[#2C2C2C]">$1,607.09</span>
              </div>
              
              <div className="flex items-center justify-between py-4">
                <span className="text-base font-medium text-[#2C2C2C]">Total Payroll</span>
                <span className="text-2xl font-bold text-[#2C2C2C]">$121,607.09</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Illustration */}
        <div className="w-72 flex flex-col items-center justify-center">
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
              
              <h4 className="text-sm font-bold text-[#2C2C2C] mb-1">Run Payroll Summary</h4>
              <button className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
                View Full Summary
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
        <button 
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            Save as draft
          </button>
          <button 
            onClick={onPrevious}
            className="px-6 py-2 border border-gray-300 text-[#2C2C2C] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button 
            onClick={onNext}
            className="px-6 py-2 bg-[#F7D046] text-[#2C2C2C] text-sm font-medium rounded-lg hover:bg-[#E5C03E] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
