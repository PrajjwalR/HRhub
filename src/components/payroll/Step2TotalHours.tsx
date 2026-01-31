"use client";

import { Clock, Plus, ChevronDown, Edit2 } from "lucide-react";
import { useState } from "react";
import OvertimeModal from "./OvertimeModal";

interface Employee {
  id: string;
  name: string;
  avatarColor: string;
  salary: string;
  totalHours: number;
  overtime: number | null;
  additionalEarnings: string | null;
  totalPay: number;
  paymentType: string;
}

interface Step2TotalHoursProps {
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
}

const initialEmployees: Employee[] = [
  { id: "1", name: "Ralph Edwards", avatarColor: "bg-yellow-500", salary: "$89,000/Year", totalHours: 172, overtime: 24, additionalEarnings: "Reimbursement", totalPay: 8500, paymentType: "Direct deposit" },
  { id: "2", name: "Arlene McCoy", avatarColor: "bg-orange-500", salary: "$24,000/year", totalHours: 160, overtime: null, additionalEarnings: null, totalPay: 2000, paymentType: "Direct deposit" },
  { id: "3", name: "Wade Warren", avatarColor: "bg-yellow-600", salary: "$24,000/year", totalHours: 178, overtime: null, additionalEarnings: null, totalPay: 2000, paymentType: "Direct deposit" },
  { id: "4", name: "Jacob Jones", avatarColor: "bg-amber-600", salary: "$24,000/year", totalHours: 156, overtime: 16, additionalEarnings: null, totalPay: 2500, paymentType: "Direct deposit" },
  { id: "5", name: "Jenny Wilson", avatarColor: "bg-blue-500", salary: "$24,000/year", totalHours: 174, overtime: null, additionalEarnings: "Reimbursement", totalPay: 2000, paymentType: "Direct deposit" },
  { id: "6", name: "Rudolp Wayne", avatarColor: "bg-red-500", salary: "$24,000/year", totalHours: 163, overtime: 32, additionalEarnings: "Reimbursement", totalPay: 2800, paymentType: "Direct deposit" },
];

export default function Step2TotalHours({ onNext, onPrevious, onCancel }: Step2TotalHoursProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const handleAddOvertime = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsModalOpen(true);
  };

  const handleSaveOvertime = (hours: number) => {
    if (selectedEmployeeId) {
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployeeId ? { ...emp, overtime: hours } : emp
      ));
    }
    setIsModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2C2C2C] mb-1">Total Hours</h2>
        <p className="text-sm text-gray-500">Check employe total hours, time off and aadtional earning</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Worked</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Additional Earnings</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pay</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Note</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr 
                key={employee.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${employee.avatarColor} flex items-center justify-center text-white text-sm font-medium`}>
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2C2C2C]">{employee.name}</p>
                      <p className="text-xs text-gray-400">FTE · {employee.salary}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm text-[#2C2C2C]">{employee.totalHours} Hours</span>
                      <span className="text-xs text-gray-400">Total Hour</span>
                      <Edit2 size={12} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                    {employee.overtime ? (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-sm text-[#2C2C2C]">{employee.overtime} Hours</span>
                        <span className="text-xs text-gray-400">Overtime</span>
                        <Edit2 size={12} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAddOvertime(employee.id)}
                        className="flex items-center gap-1 text-xs text-[#F7D046] font-medium hover:text-[#E5C03E]"
                      >
                        <Plus size={12} />
                        Add Overtime
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {employee.additionalEarnings ? (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-sm text-[#2C2C2C]">{employee.additionalEarnings}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-[#2C2C2C]">{employee.totalPay.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-2 text-sm text-[#2C2C2C]">
                    {employee.paymentType}
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <Plus size={14} />
                    Add note
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${i < 2 ? 'bg-[#F7D046]' : 'bg-gray-200'}`}
          />
        ))}
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
            onClick={onPrevious}
            className="px-6 py-2 border border-gray-300 text-[#2C2C2C] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button 
            onClick={onNext}
            className="px-6 py-2 bg-[#F7D046] text-[#2C2C2C] text-sm font-medium rounded-lg hover:bg-[#E5C03E] transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Overtime Modal */}
      <OvertimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOvertime}
        employeeName={selectedEmployee?.name || ""}
      />
    </div>
  );
}
