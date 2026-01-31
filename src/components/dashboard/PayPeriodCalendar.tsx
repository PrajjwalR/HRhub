"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";

export default function PayPeriodCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar grid
  const calendarDays = [];
  // Previous month padding
  const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }
  // Next month padding (to fill 42 cells for 6 rows, standard calendar size)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }


  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#2C2C2C] font-sans">Current pay period</h2>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-400" />
        </button>
        <h3 className="text-base font-bold text-[#2C2C2C] font-sans">{currentMonthName}</h3>
        <button 
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
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
        {calendarDays.map((dateObj, index) => {
          // Pay period logic: 1st to 15th of the CURRENT month
          const isPayPeriod = dateObj.isCurrentMonth && dateObj.day >= 1 && dateObj.day <= 15;
          
          return (
            <div
              key={index}
              className={`
                text-center py-2 rounded-lg text-xs font-medium font-sans
                ${isPayPeriod ? 'bg-[#E5EDFF] text-[#4A72FF]' : ''}
                ${!dateObj.isCurrentMonth ? 'text-gray-300' : 'text-[#2C2C2C]'}
                ${!isPayPeriod && dateObj.isCurrentMonth ? 'hover:bg-gray-50' : ''}
                transition-colors cursor-pointer
              `}
            >
              {dateObj.day}
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
            {/* Dynamic deadline for current month context */}
            <p className="text-xs font-bold text-[#2C2C2C] font-sans">
              {monthNames[currentDate.getMonth()]} 12nd, 24:00
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <CalendarIcon size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-sans mb-0.5">Pay period</p>
            <p className="text-xs font-bold text-[#2C2C2C] font-sans">
              {monthNames[currentDate.getMonth()]} 01st - 15th
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
