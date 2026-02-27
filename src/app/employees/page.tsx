"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Mail, Phone, Building2, Briefcase, ChevronRight, LayoutGrid, List } from "lucide-react";

interface Employee {
  name: string;
  employee_name: string;
  designation: string | null;
  department: string | null;
  status: string;
  image: string | null;
  company: string;
  cell_number: string | null;
  personal_email: string | null;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompany, setFilterCompany] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/employees");
        
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Get unique companies for the filter
  const companies = ["All", ...Array.from(new Set(employees.map(e => e.company).filter(Boolean)))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCompany = filterCompany === "All" || emp.company === filterCompany;
    
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-[25px] font-serif text-[#2C2C2C] flex items-center gap-2">
            <Users className="text-[#FF8C42]" size={28} />
            Employee Directory
          </h1>
          <p className="text-gray-500 mt-1">View and manage all members across the organization</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
             <button 
               onClick={() => setViewMode("grid")}
               className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-gray-100 text-[#2C2C2C]" : "text-gray-400 hover:text-gray-600"}`}
             >
               <LayoutGrid size={18} />
             </button>
             <button 
               onClick={() => setViewMode("list")}
               className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-gray-100 text-[#2C2C2C]" : "text-gray-400 hover:text-gray-600"}`}
             >
               <List size={18} />
             </button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees, roles, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {companies.map(company => (
              <button
                key={company}
                onClick={() => setFilterCompany(company)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  filterCompany === company
                  ? "bg-[#2C2C2C] text-white shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                {company}
              </button>
            ))}
          </div>
        </div>

        {error && (
           <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
             Failed to load directory: {error}
           </div>
        )}

        {/* Directory Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
             <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
               <Users size={32} />
             </div>
             <h3 className="text-lg font-bold text-[#2C2C2C]">No employees found</h3>
             <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEmployees.map((emp) => (
              <div key={emp.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                <div className="p-6 flex flex-col items-center text-center border-b border-gray-50 relative">
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${emp.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                  
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-500 border border-indigo-100 uppercase font-bold text-2xl shadow-sm mb-4 overflow-hidden relative group">
                    {emp.image ? (
                      <img src={emp.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      emp.employee_name.charAt(0)
                    )}
                  </div>
                  <h3 className="font-bold text-[#2C2C2C] text-lg leading-tight group-hover:text-[#4A72FF] transition-colors">{emp.employee_name}</h3>
                  <p className="text-xs text-[#FF8C42] font-bold uppercase tracking-wider mt-1.5">{emp.designation || "No Title"}</p>
                </div>
                
                <div className="p-5 flex-1 flex flex-col gap-3 bg-gray-50/30">
                  <div className="flex items-start gap-3 text-sm">
                    <Briefcase size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-700 font-medium">{emp.department || "Unassigned Dept"}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">{emp.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm mt-auto pt-2">
                    <Mail size={16} className="text-gray-400" />
                    <a href={`mailto:${emp.personal_email}`} className="text-gray-600 hover:text-indigo-600 truncate min-w-0">
                      {emp.personal_email || "No Email"}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-600">
                      {emp.cell_number || "No Phone"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role & Dept</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-sm">
                    {filteredEmployees.map((emp) => (
                        <tr key={emp.name} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 uppercase font-bold text-sm overflow-hidden">
                                {emp.image ? <img src={emp.image} alt="" className="w-full h-full object-cover" /> : emp.employee_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-[#2C2C2C]">{emp.employee_name}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{emp.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="flex flex-col">
                              <span className="text-[#2C2C2C] font-semibold text-sm">{emp.designation || "-"}</span>
                              <span className="text-[11px] text-gray-500">{emp.department || "-"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-[11px]">
                              {emp.personal_email && <span className="text-gray-600">{emp.personal_email}</span>}
                              {emp.cell_number && <span className="text-gray-500">{emp.cell_number}</span>}
                              {!emp.personal_email && !emp.cell_number && <span className="text-gray-400 italic">No contact info</span>}
                            </div>
                          </td>
                           <td className="px-6 py-4 text-gray-600 text-sm">
                             {emp.company}
                           </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${
                              emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
