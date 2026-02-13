"use client";

import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Employee {
  name: string;
  employee_name: string;
  designation?: string;
  department?: string;
  status: string;
  image?: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
}

export default function EmployeeTable({ employees, loading }: EmployeeTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-50 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
        <p className="text-gray-400 font-medium">No employees found. Make sure Frappe is running and has data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-gray-400 text-[13px] font-medium font-sans">
            <th className="pb-4 pl-4">Name</th>
            <th className="pb-4 text-center">Type/Designation</th>
            <th className="pb-4 text-center">Regular</th>
            <th className="pb-4 text-center">Overtime</th>
            <th className="pb-4 text-center">Sick Leave</th>
            <th className="pb-4 text-center">PTO</th>
            <th className="pb-4 text-center">Paid Holiday</th>
            <th className="pb-4 text-center">Total hour</th>
            <th className="pb-4 pr-4"></th>
          </tr>
        </thead>
        <tbody className="font-sans">
          {employees.map((emp) => (
            <tr key={emp.name} className="bg-white group hover:bg-gray-50/50 transition-colors">
              {/* Name & Avatar */}
              <td className="py-4 pl-4 rounded-l-2xl border-y border-l border-gray-50 shadow-sm">
                <Link href={`/employees/${emp.name}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    {emp.image ? (
                        <Image 
                            src={emp.image.startsWith("/") ? `http://localhost:8000${emp.image}` : emp.image} 
                            alt={emp.employee_name} 
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#E5EDFF] text-[#4A72FF] font-bold text-sm">
                            {emp.employee_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#2C2C2C] text-sm group-hover:text-[#4A72FF] transition-colors">{emp.employee_name}</p>
                    <p className="text-gray-400 text-xs">{emp.department || "No Department"}</p>
                  </div>
                </Link>
              </td>

              {/* Designation/Type */}
              <td className="py-4 border-y border-gray-50 shadow-sm text-center">
                <p className="font-semibold text-[#2C2C2C] text-sm">{emp.designation || "Employee"}</p>
                <p className="text-gray-400 text-xs">Salaried</p>
              </td>

              {/* Hours Placeholders (as per screenshot) */}
              <td className="py-4 border-y border-gray-50 shadow-sm text-[#2C2C2C] text-sm font-medium text-center">172 Hours</td>
              <td className="py-4 border-y border-gray-50 shadow-sm text-[#2C2C2C] text-sm font-medium text-center">24 Hours</td>
              <td className="py-4 border-y border-gray-50 shadow-sm text-[#2C2C2C] text-sm font-medium text-center">48 Hours</td>
              <td className="py-4 border-y border-gray-50 shadow-sm text-[#2C2C2C] text-sm font-medium text-center">-</td>
              <td className="py-4 border-y border-gray-50 shadow-sm text-[#2C2C2C] text-sm font-medium text-center">20 Hours</td>
              <td className="py-4 border-y border-gray-50 shadow-sm text-[#2C2C2C] text-sm font-bold text-center">264 Hours</td>

              {/* Action */}
              <td className="py-4 pr-4 rounded-r-2xl border-y border-r border-gray-50 shadow-sm text-right">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
