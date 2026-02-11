"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface Leave {
  name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  status: string;
}

interface LeaveCalendarProps {
  leaves: Leave[];
  holidays?: any[];
  weeklyOff?: string;
}

const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ leaves, holidays = [], weeklyOff = "Sunday" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[500px] animate-pulse"></div>;

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = [];
  // Fill empty days at the start
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  // Fill actual days
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const isLeaveDay = (day: number) => {
    if (!day) return null;
    const checkDate = new Date(year, month, day);
    
    return leaves.find(leave => {
      const [sY, sM, sD] = leave.from_date.split("-").map(Number);
      const [eY, eM, eD] = leave.to_date.split("-").map(Number);
      
      const start = new Date(sY, sM - 1, sD);
      const end = new Date(eY, eM - 1, eD);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);
      
      return checkDate >= start && checkDate <= end && leave.status.toLowerCase() !== "rejected";
    });
  };

  const isHolidayDay = (day: number) => {
    if (!day) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const checkDate = new Date(year, month, day);
    const dayName = checkDate.toLocaleDateString("en-US", { weekday: "long" });

    const isHolidate = holidays.some(h => h.holiday_date === dateStr);
    const isWOff = dayName === weeklyOff;

    return isHolidate || isWOff;
  };

  const getLeaveColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "sick leave": return "bg-[#FF8C42] text-white"; // Orange
      case "casual leave": return "bg-[#F7D046] text-[#2C2C2C]"; // Yellow
      case "privilege leave": return "bg-blue-400 text-white";
      default: return "bg-[#2C2C2C] text-white"; // Dark for others
    }
  };

  const today = new Date();
  const isToday = (day: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-xl text-[#2C2C2C]">
            <CalendarIcon size={20} />
          </div>
          <h2 className="text-xl font-bold text-[#2C2C2C] font-serif">
            {monthName} <span className="text-gray-400 font-sans font-medium ml-1">{year}</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#2C2C2C] border border-transparent hover:border-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#2C2C2C] border border-transparent hover:border-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const leave = day ? isLeaveDay(day) : null;
            const holiday = day ? isHolidayDay(day) : false;
            const currentIsToday = day ? isToday(day) : false;

            return (
              <div 
                key={index} 
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-300
                  ${!day ? "bg-transparent" : "hover:scale-105 cursor-default"}
                  ${day && !leave && !holiday ? "hover:bg-gray-50" : ""}
                  ${day && holiday && !leave ? "bg-gray-100/50 text-gray-400" : ""}
                  ${leave ? getLeaveColor(leave.leave_type) + " shadow-sm" : "text-gray-600"}
                  ${currentIsToday && !leave ? "border-2 border-[#F7D046] font-bold" : ""}
                `}
              >
                {day && (
                  <>
                    <span className={`text-sm ${leave ? "font-bold" : "font-medium"}`}>{day}</span>
                    {leave && (
                       <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white opacity-50"></div>
                    )}
                    {day && holiday && !leave && (
                       <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-gray-300"></div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 bg-gray-50/50 border-t border-gray-50">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF8C42]"></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sick Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F7D046]"></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Casual Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2C2C2C]"></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Other Leaves</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-[#F7D046]"></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;
