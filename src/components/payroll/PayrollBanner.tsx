"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";

export default function PayrollBanner() {
  return (
    <div className="bg-gradient-to-r from-[#FFF5E6] to-[#FFF9F0] rounded-2xl p-6 mb-8 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-[#F5E6D3] rounded-full -mr-10 -mt-10 opacity-50" />
      <div className="absolute right-20 bottom-0 w-40 h-40 bg-[#2C2C2C] rounded-full -mb-24 opacity-10" />
      <div className="absolute right-40 top-0 w-24 h-24 bg-[#F5E6D3] rounded-full -mt-8 opacity-30" />
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <Calendar size={24} className="text-[#F7D046]" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">Monthly Salary: Jul 01st-31th</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please run payroll by <span className="font-semibold">4:00pm PST</span> on Monday, <span className="font-semibold">November 29th</span> to pay your employees for their hard work. They'll receive their funds on Wednesday, December 1st.
          </p>
          
          <Link 
            href="/payroll/wizard"
            className="inline-block px-4 py-2 bg-[#F7D046] text-[#2C2C2C] font-medium text-sm rounded-lg hover:bg-[#E5C03E] transition-colors"
          >
            Run Late Payroll
          </Link>
        </div>
      </div>
    </div>
  );
}
