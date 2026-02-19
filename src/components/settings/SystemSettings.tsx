"use client";

import React, { useState } from "react";
import { Save, Globe, Shield, Mail, FileText, AppWindow, Calendar } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

export default function SystemSettings() {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for dropdowns
  const timeZones = [
    { label: "Asia/Kolkata", value: "Asia/Kolkata" },
    { label: "America/New_York", value: "America/New_York" },
    { label: "Europe/London", value: "Europe/London" },
  ];

  const languages = [
    { label: "English", value: "en" },
    { label: "Hindi", value: "hi" },
    { label: "Spanish", value: "es" },
  ];

  const dateFormats = [
    { label: "dd-mm-yyyy", value: "dd-mm-yyyy" },
    { label: "mm-dd-yyyy", value: "mm-dd-yyyy" },
    { label: "yyyy-mm-dd", value: "yyyy-mm-dd" },
  ];
  
  const currencies = [
    { label: "INR (₹)", value: "INR" },
    { label: "USD ($)", value: "USD" },
    { label: "EUR (€)", value: "EUR" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Here we would typically show a toast notification
      alert("System settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-[#2C2C2C]">System Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure global application settings</p>
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
          
          {/* General Settings */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Globe size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">General Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomSelect
                label="Region / Country"
                placeholder="Select Country"
                options={[{ label: "India", value: "India" }, { label: "United States", value: "USA" }]}
                defaultValue={{ label: "India", value: "India" }}
                accentColor="#4F46E5"
              />
              <CustomSelect
                label="Time Zone"
                placeholder="Select Time Zone"
                options={timeZones}
                defaultValue={timeZones[0]}
                accentColor="#4F46E5"
              />
              <CustomSelect
                label="Language"
                placeholder="Select Language"
                options={languages}
                defaultValue={languages[0]}
                accentColor="#4F46E5"
              />
               <CustomSelect
                label="Currency"
                placeholder="Select Currency"
                options={currencies}
                defaultValue={currencies[0]}
                accentColor="#4F46E5"
              />
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Date & Number Formats */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Calendar size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Date & Number Formats</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomSelect
                label="Date Format"
                options={dateFormats}
                defaultValue={dateFormats[0]}
                accentColor="#4F46E5"
              />
              <CustomSelect
                label="Time Format"
                options={[{ label: "12 Hour", value: "12H" }, { label: "24 Hour", value: "24H" }]}
                defaultValue={{ label: "12 Hour", value: "12H" }}
                accentColor="#4F46E5"
              />
               <CustomSelect
                label="Number Format"
                options={[{ label: "#,##,###.##", value: "Lakhs" }, { label: "#,###.##", value: "Millions" }]}
                defaultValue={{ label: "#,##,###.##", value: "Lakhs" }}
                accentColor="#4F46E5"
              />
              <CustomSelect
                label="First Day of Week"
                options={[{ label: "Sunday", value: "Sunday" }, { label: "Monday", value: "Monday" }]}
                defaultValue={{ label: "Monday", value: "Monday" }}
                accentColor="#4F46E5"
              />
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Security */}
          <section>
             <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <Shield size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Security</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Session Expiry (Hours)
                </label>
                <input 
                  type="number" 
                  defaultValue={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
              
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Minimum Password Score (1-4)
                </label>
                <input 
                  type="number" 
                  defaultValue={2}
                  max={4}
                  min={1}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
              
              <div className="md:col-span-2">
                 <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
                    <span className="text-sm font-medium text-gray-700">Allow only one session per user</span>
                 </label>
              </div>
               <div className="md:col-span-2">
                 <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" defaultChecked />
                    <span className="text-sm font-medium text-gray-700">Allow Login via Mobile Number</span>
                 </label>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

           {/* Email */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Mail size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Email Settings</h3>
            </div>

             <div className="grid grid-cols-1 gap-6">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Email Footer Address
                </label>
                <textarea 
                  rows={3}
                  defaultValue="HRhub Inc., 123 Business Park, Tech City"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 resize-none"
                />
              </div>
             </div>
          </section>
          
           <hr className="border-gray-100" />

           {/* Files */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileText size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">File Uploads</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Max File Size (MB)
                </label>
                <input 
                  type="number" 
                  defaultValue={10}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Allowed Extensions (comma separated)
                </label>
                <input 
                  type="text" 
                  defaultValue="pdf, jpg, png, docx, xlsx"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
            </div>
          </section>

           <hr className="border-gray-100" />
           
           {/* App */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                <AppWindow size={20} />
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">Application</h3>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Default Landing Page
                </label>
                <input 
                  type="text" 
                  defaultValue="/dashboard"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
             </div>
          </section>

        </form>
      </div>
    </div>
  );
}
