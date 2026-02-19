"use client";

import { Clock, Plus, ChevronDown, Edit2, FileText } from "lucide-react";
import { useState } from "react";
import OvertimeModal from "./OvertimeModal";
import NoteModal from "./NoteModal";
import { WizardEmployee } from "@/app/payroll/wizard/page";

interface Step2TotalHoursProps {
  employees: WizardEmployee[];
  onUpdateEmployees: (employees: WizardEmployee[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
}

const paymentTypeOptions = [
  "Direct Deposit",
  "Check",
  "Wire Transfer",
  "Cash",
];

const additionalEarningsTypes = [
  "",
  "Reimbursement",
  "Bonus",
  "Commission",
  "Allowance",
];

export default function Step2TotalHours({ employees, onUpdateEmployees, onNext, onPrevious, onCancel }: Step2TotalHoursProps) {
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState<string | null>(null);
  const [earningsDropdownOpen, setEarningsDropdownOpen] = useState<string | null>(null);

  const handleAddOvertime = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsOvertimeModalOpen(true);
  };

  const handleSaveOvertime = (hours: number) => {
    if (selectedEmployeeId) {
      const updatedEmployees = employees.map(emp => 
        emp.id === selectedEmployeeId 
          ? { ...emp, overtime: hours, totalPay: calculateTotalPay(emp.baseSalary || 0, emp.totalHours, hours, emp.additionalEarnings) } 
          : emp
      );
      onUpdateEmployees(updatedEmployees);
    }
    setIsOvertimeModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleAddNote = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (note: string) => {
    if (selectedEmployeeId) {
      const updatedEmployees = employees.map(emp => 
        emp.id === selectedEmployeeId ? { ...emp, notes: note } : emp
      );
      onUpdateEmployees(updatedEmployees);
    }
    setIsNoteModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const updateEmployeeField = (employeeId: string, field: keyof WizardEmployee, value: any) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeId) {
        const updated = { ...emp, [field]: value };
        // Recalculate total pay when relevant fields change
        if (['totalHours', 'overtime', 'additionalEarnings', 'baseSalary'].includes(field)) {
          updated.totalPay = calculateTotalPay(
            updated.baseSalary || 0,
            updated.totalHours,
            updated.overtime,
            updated.additionalEarnings
          );
        }
        return updated;
      }
      return emp;
    });
    onUpdateEmployees(updatedEmployees);
  };

  const calculateTotalPay = (baseSalary: number, hours: number, overtime: number, additionalEarnings: number): number => {
    // Monthly salary calculation (assuming 160 standard hours)
    const hourlyRate = baseSalary / 160;
    const regularPay = hours * hourlyRate;
    const overtimePay = overtime * hourlyRate * 1.5; // 1.5x for overtime
    return Math.round(regularPay + overtimePay + additionalEarnings);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">Total Hours</h2>
        <p className="text-sm text-gray-500">Check employee total hours, time off and additional earning</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-visible mb-6">
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
                      <p className="text-sm font-semibold text-black">{employee.name}</p>
                      <p className="text-xs text-gray-400">FTE · {formatCurrency(employee.baseSalary || 0)}/Year</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <input
                        type="number"
                        value={employee.totalHours}
                        onChange={(e) => updateEmployeeField(employee.id, 'totalHours', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-black text-center focus:outline-none focus:border-[#F7D046]"
                      />
                      <span className="text-xs text-gray-400">Total Hour</span>
                      <Edit2 size={12} className="text-gray-400" />
                    </div>
                    {employee.overtime > 0 ? (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <input
                          type="number"
                          value={employee.overtime}
                          onChange={(e) => updateEmployeeField(employee.id, 'overtime', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-black text-center focus:outline-none focus:border-[#F7D046]"
                        />
                        <span className="text-xs text-gray-400">Overtime</span>
                        <Edit2 size={12} className="text-gray-400" />
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
                  <div className="space-y-2">
                    <div className="relative">
                      <button 
                        onClick={() => setEarningsDropdownOpen(earningsDropdownOpen === employee.id ? null : employee.id)}
                        className="flex items-center gap-2 text-sm text-black border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50"
                      >
                        {employee.additionalEarningsType || "Select type"}
                        <ChevronDown size={14} className="text-gray-400" />
                      </button>
                      {earningsDropdownOpen === employee.id && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                          {additionalEarningsTypes.map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                updateEmployeeField(employee.id, 'additionalEarningsType', type);
                                setEarningsDropdownOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                            >
                              {type || "None"}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {employee.additionalEarningsType && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">₹</span>
                        <input
                          type="number"
                          value={employee.additionalEarnings}
                          onChange={(e) => updateEmployeeField(employee.id, 'additionalEarnings', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-sm text-black focus:outline-none focus:border-[#F7D046]"
                        />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">{formatCurrency(employee.totalPay)}</span>
                    <button 
                      onClick={() => {
                        const newPay = prompt("Enter total pay:", employee.totalPay.toString());
                        if (newPay) {
                          updateEmployeeField(employee.id, 'totalPay', parseInt(newPay) || 0);
                        }
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 relative">
                  <div className="relative">
                    <button 
                      onClick={() => setPaymentDropdownOpen(paymentDropdownOpen === employee.id ? null : employee.id)}
                      className="flex items-center gap-2 text-sm text-black"
                    >
                      {employee.paymentType}
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>
                    {paymentDropdownOpen === employee.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                        {paymentTypeOptions.map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              updateEmployeeField(employee.id, 'paymentType', type);
                              setPaymentDropdownOpen(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleAddNote(employee.id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    {employee.notes ? (
                      <>
                        <FileText size={14} className="text-green-500" />
                        <span className="text-green-600">View note</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Add note
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Total Payroll</span>
          <span className="text-lg font-bold text-black">
            {formatCurrency(employees.reduce((sum, emp) => sum + emp.totalPay, 0))}
          </span>
        </div>
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
            className="px-6 py-2 border border-gray-300 text-black text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button 
            onClick={onNext}
            className="px-6 py-2 bg-[#F7D046] text-black text-sm font-medium rounded-lg hover:bg-[#E5C03E] transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Overtime Modal */}
      <OvertimeModal
        isOpen={isOvertimeModalOpen}
        onClose={() => setIsOvertimeModalOpen(false)}
        onSave={handleSaveOvertime}
        employeeName={selectedEmployee?.name || ""}
      />

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        employeeName={selectedEmployee?.name || ""}
        initialNote={selectedEmployee?.notes || ""}
      />
    </div>
  );
}
