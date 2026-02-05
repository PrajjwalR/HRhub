"use client";

import { ChevronDown, Check } from "lucide-react";
import Link from "next/link";

interface PayrollItem {
  id: string;
  name: string;
  type: string;
  dayOfWeek: string;
  payDate: string;
  employees: number;
  totalPayment: string;
  status: "paid" | "late" | "draft";
  approvedDate: string | null;
  action?: string;
}

const payrollData: PayrollItem[] = [
  {
    id: "1",
    name: "Monthly Salary: Jul 01st - 31st",
    type: "Regular",
    dayOfWeek: "Wed",
    payDate: "31th Jul 2022",
    employees: 22,
    totalPayment: "$23,960.00",
    status: "late",
    approvedDate: null,
    action: "Run Late Payroll"
  },
  {
    id: "2",
    name: "Bonus: Jun 15th - 30th",
    type: "Off-cycle",
    dayOfWeek: "Mon",
    payDate: "30th Jun 2022",
    employees: 22,
    totalPayment: "$2,000.00",
    status: "draft",
    approvedDate: null,
    action: "Setup"
  },
  {
    id: "3",
    name: "Monthly Salary: May 01st - 31st",
    type: "Regular",
    dayOfWeek: "Tue",
    payDate: "30th May 2022",
    employees: 22,
    totalPayment: "$23,960.00",
    status: "paid",
    approvedDate: "30th May 2020"
  },
  {
    id: "4",
    name: "Bonus: April 01st - 15th",
    type: "Off-cycle",
    dayOfWeek: "Thu",
    payDate: "15th April 2022",
    employees: 22,
    totalPayment: "$2,500.00",
    status: "paid",
    approvedDate: "14th Apr 2020"
  },
  {
    id: "5",
    name: "Monthly Salary: April 01st - 30th",
    type: "Regular",
    dayOfWeek: "Fri",
    payDate: "30th April 2022",
    employees: 22,
    totalPayment: "$23,960.00",
    status: "paid",
    approvedDate: "30th Apr 2020"
  },
  {
    id: "6",
    name: "Bonus: March 01st - 15th",
    type: "Regular",
    dayOfWeek: "Sat",
    payDate: "29th March 2022",
    employees: 22,
    totalPayment: "$23,960.00",
    status: "paid",
    approvedDate: "15th Mar 2020"
  },
  {
    id: "7",
    name: "Monthly Salary: March 01-30",
    type: "Regular",
    dayOfWeek: "Wed",
    payDate: "29th March 2022",
    employees: 22,
    totalPayment: "$3,960.00",
    status: "paid",
    approvedDate: "30th Mar 2020"
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
          Paid
        </span>
      );
    case "late":
      return (
        <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          Late
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center gap-1 text-gray-500 text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          Draft
        </span>
      );
    default:
      return null;
  }
};

export default function PayrollTable() {
  return (
    <div>
      {/* Header with filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold text-[#2C2C2C]">32 Payroll</h2>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
              Type: <span className="font-medium">All type</span>
              <ChevronDown size={16} />
            </button>
            
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
              Status: <span className="font-medium">All Status</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        
        <button className="px-4 py-2 border border-gray-300 text-[#2C2C2C] font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors">
          Run Off-Cycle Payroll
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Pay runs</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Pay date</th>
              <th className="text-center px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Employees</th>
              <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Total payment</th>
              <th className="text-center px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Approved date</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map((item, index) => (
              <tr 
                key={item.id} 
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-black">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.type}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                      {item.dayOfWeek}
                    </span>
                    <span className="text-sm text-black">{item.payDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-black">{item.employees}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-black">{item.totalPayment}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4">
                  {item.approvedDate ? (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Check size={14} className="text-gray-400" />
                      {item.approvedDate}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {item.action && (
                    <Link 
                      href="/payroll/wizard"
                      className={`inline-block px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                        item.status === 'late' 
                          ? 'border-red-200 text-red-500 hover:bg-red-50' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.action}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
