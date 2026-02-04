"use client";

import { Search, ChevronUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchEmployeeSalaryAssignment } from "@/lib/frappePayroll";
import { WizardEmployee } from "@/app/payroll/wizard/page";

interface Step1EmployeeSelectProps {
  onNext: () => void;
  onCancel: () => void;
  onEmployeesSelected: (employees: WizardEmployee[]) => void;
  payPeriod: { start: string; end: string };
}

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
  hasSalaryStructure: boolean;
  salaryStructureName?: string;
  baseSalary?: number;
}

export default function Step1EmployeeSelect({ onNext, onCancel, onEmployeesSelected, payPeriod }: Step1EmployeeSelectProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees and their salary assignments
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        
        // Fetch employees from attendance API
        const response = await fetch("/api/attendance");
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        
        const employeeData = await response.json();
        
        // For each employee, check if they have a salary structure assignment
        const employeesWithAssignments = await Promise.all(
          employeeData.map(async (emp: any) => {
            try {
              const assignment = await fetchEmployeeSalaryAssignment(emp.id);
              
              return {
                id: emp.id,
                name: emp.name,
                avatarColor: emp.avatarColor,
                totalHours: emp.totalHour || 160, // Default to 160 hours
                overtime: emp.overtime || 0,
                paymentMethod: "Digital Transfer",
                workTime: emp.type || "FTE",
                selected: !!assignment, // Auto-select if has salary structure
                hasSalaryStructure: !!assignment,
                salaryStructureName: assignment?.salary_structure,
                baseSalary: assignment?.base || 0,
              };
            } catch (err) {
              console.error(`Error fetching assignment for ${emp.id}:`, err);
              return {
                id: emp.id,
                name: emp.name,
                avatarColor: emp.avatarColor,
                totalHours: emp.totalHour || 160,
                overtime: emp.overtime || 0,
                paymentMethod: "Digital Transfer",
                workTime: emp.type || "FTE",
                selected: false,
                hasSalaryStructure: false,
              };
            }
          })
        );
        
        setEmployees(employeesWithAssignments);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching employees:", err);
        setError(err.message || "Failed to load employees");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const selectedCount = employees.filter(e => e.selected).length;

  const toggleEmployee = (id: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, selected: !emp.selected } : emp
    ));
  };

  const toggleAll = () => {
    const selectableEmployees = employees.filter(e => e.hasSalaryStructure);
    const allSelected = selectableEmployees.every(e => e.selected);
    setEmployees(prev => prev.map(emp => 
      emp.hasSalaryStructure ? { ...emp, selected: !allSelected } : emp
    ));
  };

  const unselectAll = () => {
    setEmployees(prev => prev.map(emp => ({ ...emp, selected: false })));
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = async () => {
    // Convert selected employees to WizardEmployee format
    const selectedEmps = employees.filter(e => e.selected && e.hasSalaryStructure);
    
    // Fetch bank details for each employee
    const selectedEmployees: WizardEmployee[] = await Promise.all(
      selectedEmps.map(async (emp) => {
        let bankName = "";
        let accountNumber = "";
        
        try {
          const response = await fetch(`/api/bank-account?employee=${emp.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.bankAccount) {
              bankName = data.bankAccount.bank || "";
              accountNumber = data.bankAccount.bank_account_no || "";
            }
          }
        } catch (err) {
          console.error(`Error fetching bank details for ${emp.id}:`, err);
        }
        
        return {
          id: emp.id,
          name: emp.name,
          avatarColor: emp.avatarColor,
          hasSalaryStructure: emp.hasSalaryStructure,
          salaryStructureName: emp.salaryStructureName,
          baseSalary: emp.baseSalary || 0,
          totalHours: emp.totalHours,
          overtime: emp.overtime || 0,
          additionalEarnings: 0,
          additionalEarningsType: "",
          totalPay: emp.baseSalary || 0,
          paymentType: emp.paymentMethod,
          notes: "",
          paidTimeOff: 0,
          paidHoliday: 0,
          sickLeave: 0,
          bankName,
          accountNumber,
        };
      })
    );
    
    onEmployeesSelected(selectedEmployees);
    onNext();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Pay period & Employee</h2>
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7D046] mb-4"></div>
            <p className="text-gray-500">Loading employees...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-4">
          <p className="text-red-600 font-medium">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Warning for employees without salary structure */}
      {!isLoading && !error && employees.some(e => !e.hasSalaryStructure) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-orange-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-900">
              Some employees don't have salary structures assigned
            </p>
            <p className="text-xs text-orange-700 mt-1">
              Employees without salary structures cannot be included in payroll. Please assign salary structures in Frappe first.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-12 px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={employees.filter(e => e.hasSalaryStructure).length > 0 && employees.filter(e => e.hasSalaryStructure).every(e => e.selected)}
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
                      disabled={!employee.hasSalaryStructure}
                      className="w-4 h-4 rounded border-gray-300 text-[#F7D046] focus:ring-[#F7D046] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${employee.avatarColor} flex items-center justify-center text-white text-sm font-medium`}>
                        {employee.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-black">
                          {employee.name}
                        </span>
                        {!employee.hasSalaryStructure && (
                          <div className="group relative">
                            <AlertCircle size={16} className="text-orange-500" />
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                              No salary structure assigned. Please assign in Frappe first.
                            </div>
                          </div>
                        )}
                        {employee.hasSalaryStructure && employee.salaryStructureName && (
                          <span className="text-xs text-gray-400">
                            ({employee.salaryStructureName})
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-black">
                    {employee.totalHours} Hours
                  </td>
                  <td className="px-4 py-4 text-sm text-black">
                    {employee.overtime ? `${employee.overtime} Hours` : "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-black">
                    {employee.paymentMethod}
                  </td>
                  <td className="px-4 py-4 text-sm text-black">
                    {employee.workTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {!isLoading && !error && (
        <div className="flex items-center justify-between py-4 border-t border-gray-100">
          <span className="text-sm font-medium text-black">
            {selectedCount} Employee{selectedCount !== 1 ? 's' : ''} selected
            {employees.filter(e => !e.hasSalaryStructure).length > 0 && (
              <span className="text-xs text-orange-600 ml-2">
                ({employees.filter(e => !e.hasSalaryStructure).length} without salary structure)
              </span>
            )}
          </span>
          <button 
            onClick={unselectAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Unselect all
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {!isLoading && !error && (
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
              onClick={handleNext}
              disabled={selectedCount === 0}
              className="px-6 py-2 bg-[#F7D046] text-black text-sm font-medium rounded-lg hover:bg-[#E5C03E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
