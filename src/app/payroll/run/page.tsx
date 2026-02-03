"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Download, FileText, CheckCircle2, AlertCircle, Search } from "lucide-react";
import Link from "next/link";
import { createSalarySlip, fetchEmployeeSalaryAssignment, fetchEmployeeSalarySlips } from "@/lib/frappePayroll";

interface Employee {
  id: string;
  name: string;
  avatarColor: string;
  hasSalaryStructure: boolean;
  salaryStructureName?: string;
  baseSalary?: number;
}

export default function RunPayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [payPeriod, setPayPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlips, setGeneratedSlips] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/attendance");
        if (!response.ok) throw new Error("Failed to fetch employees");
        
        const employeeData = await response.json();
        
        const employeesWithAssignments = await Promise.all(
          employeeData.map(async (emp: any) => {
            try {
              const assignment = await fetchEmployeeSalaryAssignment(emp.id);
              return {
                id: emp.id,
                name: emp.name,
                avatarColor: emp.avatarColor,
                hasSalaryStructure: !!assignment,
                salaryStructureName: assignment?.salary_structure,
                baseSalary: assignment?.base,
              };
            } catch (err) {
              return {
                id: emp.id,
                name: emp.name,
                avatarColor: emp.avatarColor,
                hasSalaryStructure: false,
              };
            }
          })
        );
        
        setEmployees(employeesWithAssignments);
        // Auto-select employees with salary structures
        const autoSelect = new Set(
          employeesWithAssignments
            .filter(e => e.hasSalaryStructure)
            .map(e => e.id)
        );
        setSelectedEmployees(autoSelect);
      } catch (err: any) {
        setError(err.message || "Failed to load employees");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleGenerateSlips = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const selectedEmps = employees.filter(e => selectedEmployees.has(e.id) && e.hasSalaryStructure);
      
      const slips = await Promise.all(
        selectedEmps.map(async (emp) => {
          try {
            // Try to create a new salary slip
            const slip = await createSalarySlip({
              employee: emp.id,
              posting_date: new Date().toISOString().split("T")[0],
              start_date: payPeriod.start,
              end_date: payPeriod.end,
            });
            return { employee: emp, slip, success: true, isExisting: false };
          } catch (err: any) {
            console.error(`Failed to create slip for ${emp.name}:`, err);
            
            // If salary slip already exists, fetch it instead
            if (err.message.includes("already created for this period")) {
              try {
                // Fetch existing salary slips for this employee and period
                const existingSlips = await fetchEmployeeSalarySlips(
                  emp.id,
                  payPeriod.start,
                  payPeriod.end
                );
                
                if (existingSlips && existingSlips.length > 0) {
                  // Return the most recent existing slip
                  return { 
                    employee: emp, 
                    slip: existingSlips[0], 
                    success: true, 
                    isExisting: true 
                  };
                }
              } catch (fetchErr) {
                console.error(`Failed to fetch existing slip for ${emp.name}:`, fetchErr);
              }
            }
            
            // If we couldn't fetch existing slip or it's a different error
            let errorMsg = err.message;
            if (errorMsg.includes("already created for this period")) {
              errorMsg = "Salary slip already exists for this period";
            }
            return { employee: emp, error: errorMsg, success: false };
          }
        })
      );

      setGeneratedSlips(slips);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate salary slips");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleEmployee = (id: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmployees(newSelected);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const successfulSlips = generatedSlips.filter(s => s.success);
  const failedSlips = generatedSlips.filter(s => !s.success);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100 px-8 py-4">
          <div className="flex items-center gap-6">
            <Link href="/payroll" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-serif text-[#2C2C2C]">Payroll Generated</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">
              Payroll Processed Successfully!
            </h2>
            <p className="text-gray-600 mb-8">
              {successfulSlips.length} salary slip{successfulSlips.length !== 1 ? "s" : ""} ready to view
            </p>

            {successfulSlips.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4 text-left">
                <h3 className="font-semibold text-green-900 mb-4">Ready to View:</h3>
                <div className="space-y-2">
                  {successfulSlips.map((item, index) => (
                    <Link
                      key={index}
                      href={`/salary-slip/${item.slip.name}`}
                      className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-green-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${item.employee.avatarColor} flex items-center justify-center text-white text-sm font-medium`}>
                          {item.employee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-black">{item.employee.name}</span>
                            {item.isExisting ? (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Existing
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {item.isExisting ? "Already generated - Click to view" : "Click to view salary slip"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-600 group-hover:text-green-700" />
                        <span className="text-sm text-green-600 group-hover:text-green-700">View →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {failedSlips.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4 text-left">
                <h3 className="font-semibold text-red-900 mb-4">Failed:</h3>
                <div className="space-y-2">
                  {failedSlips.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${item.employee.avatarColor} flex items-center justify-center text-white text-sm font-medium`}>
                          {item.employee.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-black">{item.employee.name}</span>
                      </div>
                      <span className="text-xs text-red-600">{item.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 mt-8">
              <Link href="/payroll" className="px-6 py-3 bg-[#F7D046] text-[#2C2C2C] font-medium rounded-lg hover:bg-[#E5C03E]">
                Back to Payroll
              </Link>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setGeneratedSlips([]);
                }}
                className="px-6 py-3 border border-gray-300 text-[#2C2C2C] font-medium rounded-lg hover:bg-gray-50"
              >
                Generate More
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-8 py-4">
        <div className="flex items-center gap-6">
          <Link href="/payroll" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-serif text-[#2C2C2C]">Run Payroll</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Pay Period Selection */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-[#2C2C2C] mb-4">Pay Period</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Start Date</label>
              <input
                type="date"
                value={payPeriod.start}
                onChange={(e) => setPayPeriod({ ...payPeriod, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F7D046] text-[#2C2C2C]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">End Date</label>
              <input
                type="date"
                value={payPeriod.end}
                onChange={(e) => setPayPeriod({ ...payPeriod, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F7D046] text-[#2C2C2C]"
              />
            </div>
          </div>
        </div>

        {/* Employee Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#2C2C2C]">Select Employees</h3>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[#F7D046] text-[#2C2C2C]"
              />
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7D046]"></div>
              <p className="text-gray-500 mt-4">Loading employees...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600">⚠️ {error}</p>
            </div>
          )}

          {!isLoading && !error && employees.some(e => !e.hasSalaryStructure) && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Some employees don't have salary structures assigned
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  They cannot be included in payroll. Assign salary structures in Frappe first.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={employees.filter(e => e.hasSalaryStructure).every(e => selectedEmployees.has(e.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees(new Set(employees.filter(emp => emp.hasSalaryStructure).map(emp => emp.id)));
                          } else {
                            setSelectedEmployees(new Set());
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Salary Structure</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.has(employee.id)}
                          onChange={() => toggleEmployee(employee.id)}
                          disabled={!employee.hasSalaryStructure}
                          className="w-4 h-4 rounded border-gray-300 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${employee.avatarColor} flex items-center justify-center text-white text-sm font-medium`}>
                            {employee.name.charAt(0)}
                          </div>
                          <span className="font-medium text-black">{employee.name}</span>
                          {!employee.hasSalaryStructure && (
                            <AlertCircle size={16} className="text-orange-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-black">
                        {employee.salaryStructureName || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-black">
                        {employee.baseSalary ? `₹${employee.baseSalary.toLocaleString()}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {selectedEmployees.size} employee{selectedEmployees.size !== 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/payroll"
                className="px-6 py-2 border border-gray-300 text-[#2C2C2C] font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                onClick={handleGenerateSlips}
                disabled={selectedEmployees.size === 0 || isGenerating}
                className="px-6 py-2 bg-[#F7D046] text-[#2C2C2C] font-medium rounded-lg hover:bg-[#E5C03E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2C2C2C]"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Generate Salary Slips
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
