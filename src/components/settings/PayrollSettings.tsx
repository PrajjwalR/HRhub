"use client";

import React, { useState } from "react";
import { Save, Calculator, Receipt, Mail, Briefcase } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

export default function PayrollSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Payroll settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-[#2C2C2C]">Payroll Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure salary calculations and processing rules</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 font-medium text-sm"
        >
          {isLoading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Save size={18} />
          )}
          Save Changes
        </button>
      </div>

      <div className="p-8 max-w-4xl">
        <form onSubmit={handleSave} className="space-y-10">
          
          {/* Working Days */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <Calculator size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Working Days Calculation</h3>
            </div>
            
             <div className="space-y-4">
                 <div className="space-y-4">
                 <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Calculate Working Days based on Leave Application</span>
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
                 </label>
                  <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Include Holidays in Salary</span>
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
                 </label>
              </div>
             </div>
          </section>

          <hr className="border-gray-100" />

          {/* Salary Slip */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Receipt size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Salary Slip Configuration</h3>
            </div>
            
             <div className="space-y-4">
               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Show Leave Balance in Salary Slip</span>
                  <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
               </label>
                <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Disable Rounded Total</span>
                  <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
               </label>
             </div>
          </section>

          <hr className="border-gray-100" />

          {/* Email */}
          <section>
             <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                <Mail size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Email Automation</h3>
            </div>

             <div className="space-y-4">
               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Email Salary Slip to Employee</span>
                  <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
               </label>
               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Encrypt Salary Slips PDF</span>
                  <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
               </label>
             </div>
          </section>

          <hr className="border-gray-100" />
          
          {/* Accounting */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Briefcase size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Accounting</h3>
            </div>

             <div className="space-y-4">
               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Process Payroll Accounting Entry</span>
                  <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
               </label>
             </div>
          </section>

        </form>
      </div>
    </div>
  );
}
