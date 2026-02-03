"use client";

import { WizardEmployee } from "@/app/payroll/wizard/page";

interface Step3TimeOffProps {
  employees: WizardEmployee[];
  onUpdateEmployees: (employees: WizardEmployee[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
}

export default function Step3TimeOff({ employees, onUpdateEmployees, onNext, onPrevious, onCancel }: Step3TimeOffProps) {
  const updateEmployeeField = (employeeId: string, field: keyof WizardEmployee, value: any) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeId) {
        return { ...emp, [field]: value };
      }
      return emp;
    });
    onUpdateEmployees(updatedEmployees);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // Assume 100 hours remaining for each category by default
  const getRemaining = (used: number, total: number = 100) => total - used;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">Time Off</h2>
        <p className="text-sm text-gray-500">Check employee total hours, time off and additional earning</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Employees</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Time Off</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Holiday</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Sick Leave</th>
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
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="number" 
                      value={employee.paidTimeOff}
                      onChange={(e) => updateEmployeeField(employee.id, 'paidTimeOff', parseInt(e.target.value) || 0)}
                      className="w-16 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center text-black focus:outline-none focus:border-[#F7D046]"
                    />
                    <span className="text-xs text-gray-400">hrs</span>
                  </div>
                  <p className="text-xs text-gray-400">{getRemaining(employee.paidTimeOff)} hrs remaining</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="number" 
                      value={employee.paidHoliday}
                      onChange={(e) => updateEmployeeField(employee.id, 'paidHoliday', parseInt(e.target.value) || 0)}
                      className="w-16 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center text-black focus:outline-none focus:border-[#F7D046]"
                    />
                    <span className="text-xs text-gray-400">hrs</span>
                  </div>
                  <p className="text-xs text-gray-400">{getRemaining(employee.paidHoliday)} hrs remaining</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="number" 
                      value={employee.sickLeave}
                      onChange={(e) => updateEmployeeField(employee.id, 'sickLeave', parseInt(e.target.value) || 0)}
                      className="w-16 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center text-black focus:outline-none focus:border-[#F7D046]"
                    />
                    <span className="text-xs text-gray-400">hrs</span>
                  </div>
                  <p className="text-xs text-gray-400">{getRemaining(employee.sickLeave, 120)} hrs remaining</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Total PTO Used</p>
            <p className="text-lg font-bold text-black">{employees.reduce((sum, emp) => sum + emp.paidTimeOff, 0)} hrs</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Holiday Used</p>
            <p className="text-lg font-bold text-black">{employees.reduce((sum, emp) => sum + emp.paidHoliday, 0)} hrs</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Sick Leave Used</p>
            <p className="text-lg font-bold text-black">{employees.reduce((sum, emp) => sum + emp.sickLeave, 0)} hrs</p>
          </div>
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
    </div>
  );
}
