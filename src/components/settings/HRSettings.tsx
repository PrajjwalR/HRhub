"use client";

import React, { useState } from "react";
import { Save, Users, Bell, Briefcase, UserCheck, Clock } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

export default function HRSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("HR settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-[#2C2C2C]">HR Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage employee and departmental configurations</p>
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
          
          {/* Employee Settings */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Users size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Employee Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Retirement Age
                </label>
                <input 
                  type="number" 
                  defaultValue={60}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Standard Working Hours (Per Day)
                </label>
                <input 
                  type="number" 
                  defaultValue={8}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>

               <CustomSelect
                label="Employee Naming By"
                options={[{ label: "Employee Number", value: "Employee Number" }, { label: "Naming Series", value: "Naming Series" }]}
                defaultValue={{ label: "Employee Number", value: "Employee Number" }}
                accentColor="#4F46E5"
              />
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Reminders */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Bell size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Automated Reminders</h3>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-700">Send Work Anniversary Reminders</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
              </label>
              
              <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                 <span className="text-sm font-medium text-gray-700">Send Birthday Reminders</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
              </label>

               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                 <span className="text-sm font-medium text-gray-700">Send Holiday Reminders</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
              </label>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Leave & Expense */}
          <section>
             <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Briefcase size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Leave & Expense</h3>
            </div>

            <div className="space-y-4">
               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                 <span className="text-sm font-medium text-gray-700">Leave Approver is Mandatory</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
              </label>

               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                 <span className="text-sm font-medium text-gray-700">Expense Approver is Mandatory</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
              </label>
               
               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                 <span className="text-sm font-medium text-gray-700">Allow Auto Leave Encashment</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
              </label>
            </div>
          </section>

          <hr className="border-gray-100" />
          
          {/* Shift & Attendance */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Clock size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Shift & Attendance</h3>
            </div>

             <div className="space-y-4">
               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                 <span className="text-sm font-medium text-gray-700">Allow Check-in from Mobile App</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
              </label>
               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                 <span className="text-sm font-medium text-gray-700">Enable Geolocation Tracking</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
              </label>
             </div>
          </section>

           <hr className="border-gray-100" />

           {/* Hiring */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                <UserCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Hiring & Recruitment</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                 <span className="text-sm font-medium text-gray-700">Check Vacancy on Job Offer Creation</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
              </label>
               <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                 <span className="text-sm font-medium text-gray-700">Send Interview Reminders</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
              </label>
            </div>
          </section>

        </form>
      </div>
    </div>
  );
}
