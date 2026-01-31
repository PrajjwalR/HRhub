"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";

export default function PayPeriodCalendar() {
  const [currentMonth] = useState("July 2022");
  
  // Calendar data for July 2022
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = [
    26, 27, 28, 29, 30, 1, 2,
    3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16,
    17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30,
  ];

  // Pay period: July 1st - 15th (indices 5-18)
  const payPeriodDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#2C2C2C] font-sans">Current pay period</h2>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={18} className="text-gray-400" />
        </button>
        <h3 className="text-base font-bold text-[#2C2C2C] font-sans">{currentMonth}</h3>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-[10px] text-gray-400 font-medium font-sans py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((day, index) => {
          const isPayPeriod = payPeriodDays.includes(day) && day <= 15;
          const isPreviousMonth = index < 5;
          
          return (
            <div
              key={index}
              className={`
                text-center py-2 rounded-lg text-xs font-medium font-sans
                ${isPayPeriod ? 'bg-[#E5EDFF] text-[#4A72FF]' : ''}
                ${isPreviousMonth ? 'text-gray-300' : 'text-[#2C2C2C]'}
                ${!isPayPeriod && !isPreviousMonth ? 'hover:bg-gray-50' : ''}
                transition-colors cursor-pointer
              `}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-sans mb-0.5">Approval deadline</p>
            <p className="text-xs font-bold text-[#2C2C2C] font-sans">July 12nd, 24:00</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <CalendarIcon size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-sans mb-0.5">Pay period</p>
            <p className="text-xs font-bold text-[#2C2C2C] font-sans">July 01st - 15th</p>
          </div>
        </div>
      </div>
    </div>
  );
}
