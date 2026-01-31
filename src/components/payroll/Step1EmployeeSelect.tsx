"use client";

import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  avatarColor: string;
  totalHours: number;
  overtime: number | null;
  paymentMethod: string;
  workTime: string;
  selected: boolean;
}

interface Step1EmployeeSelectProps {
  onNext: () => void;
  onCancel: () => void;
}

const initialEmployees: Employee[] = [
  { id: "1", name: "Ralph Edwards", avatar: "", avatarColor: "bg-yellow-500", totalHours: 172, overtime: 24, paymentMethod: "Digital Transfer", workTime: "FTE", selected: true },
  { id: "2", name: "Arlene McCoy", avatar: "", avatarColor: "bg-orange-500", totalHours: 160, overtime: null, paymentMethod: "Digital Transfer", workTime: "FTE", selected: true },
  { id: "3", name: "Wade Warren", avatar: "", avatarColor: "bg-yellow-600", totalHours: 178, overtime: null, paymentMethod: "Digital Transfer", workTime: "FTE", selected: true },
  { id: "4", name: "Jacob Jones", avatar: "", avatarColor: "bg-amber-600", totalHours: 156, overtime: 16, paymentMethod: "Digital Transfer", workTime: "FTE", selected: true },
  { id: "5", name: "Jenny Wilson", avatar: "", avatarColor: "bg-blue-500", totalHours: 174, overtime: null, paymentMethod: "Digital Transfer", workTime: "FTE", selected: true },
  { id: "6", name: "Rudolp Wayne", avatar: "", avatarColor: "bg-red-500", totalHours: 163, overtime: 32, paymentMethod: "Digital Transfer", workTime: "FTE", selected: true },
  { id: "7", name: "Jennifer Kwok", avatar: "", avatarColor: "bg-orange-400", totalHours: 162, overtime: null, paymentMethod: "Check", workTime: "FTE", selected: true },
  { id: "8", name: "Lizt Tarpen", avatar: "", avatarColor: "bg-purple-500", totalHours: 172, overtime: 18, paymentMethod: "Check", workTime: "FTE", selected: true },
];

export default function Step1EmployeeSelect({ onNext, onCancel }: Step1EmployeeSelectProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCount = employees.filter(e => e.selected).length;

  const toggleEmployee = (id: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, selected: !emp.selected } : emp
    ));
  };

  const toggleAll = () => {
    const allSelected = employees.every(e => e.selected);
    setEmployees(prev => prev.map(emp => ({ ...emp, selected: !allSelected })));
  };

  const unselectAll = () => {
    setEmployees(prev => prev.map(emp => ({ ...emp, selected: false })));
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-1">Pay period & Employee</h2>
          <p className="text-sm text-gray-500">Select employee to include in this payroll</p>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[#F7D046]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="w-12 px-4 py-3">
                <input 
                  type="checkbox" 
                  checked={employees.every(e => e.selected)}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#F7D046] focus:ring-[#F7D046]"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Full Name
                  <ChevronUp size={14} className="text-gray-400" />
                </div>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Total Hour
                  <ChevronUp size={14} className="text-gray-400" />
                </div>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Overtime
                  <ChevronUp size={14} className="text-gray-400" />
                </div>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Payment Method
                  <ChevronUp size={14} className="text-gray-400" />
                </div>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Work Time
                  <ChevronUp size={14} className="text-gray-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr 
                key={employee.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <input 
                    type="checkbox" 
                    checked={employee.selected}
                    onChange={() => toggleEmployee(employee.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#F7D046] focus:ring-[#F7D046]"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${employee.avatarColor} flex items-center justify-center text-white text-sm font-medium`}>
                      {employee.name.charAt(0)}
                    </div>
                    <Link 
                      href={`/payroll/employee/${employee.id}`}
                      className="text-sm font-medium text-[#2C2C2C] hover:text-[#F7D046] hover:underline transition-colors"
                    >
                      {employee.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-[#2C2C2C]">
                  {employee.totalHours} Hours
                </td>
                <td className="px-4 py-4 text-sm text-[#2C2C2C]">
                  {employee.overtime ? `${employee.overtime} Hours` : "-"}
                </td>
                <td className="px-4 py-4 text-sm text-[#2C2C2C]">
                  {employee.paymentMethod}
                </td>
                <td className="px-4 py-4 text-sm text-[#2C2C2C]">
                  {employee.workTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-4 border-t border-gray-100">
        <span className="text-sm font-medium text-[#2C2C2C]">
          {selectedCount} Employes selected
        </span>
        <button 
          onClick={unselectAll}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Unselect all
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
