"use client";

interface Employee {
  id: string;
  name: string;
  avatarColor: string;
  salary: string;
  paidTimeOff: { hours: number; remaining: number };
  paidHoliday: { hours: number; remaining: number };
  sickLeave: { hours: number; remaining: number };
}

interface Step3TimeOffProps {
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
}

const employees: Employee[] = [
  { id: "1", name: "Ralph Edwards", avatarColor: "bg-yellow-500", salary: "$89,000/Year", paidTimeOff: { hours: 0, remaining: 100 }, paidHoliday: { hours: 20, remaining: 80 }, sickLeave: { hours: 48, remaining: 52 } },
  { id: "2", name: "Arlene McCoy", avatarColor: "bg-orange-500", salary: "$24,000/year", paidTimeOff: { hours: 50, remaining: 50 }, paidHoliday: { hours: 0, remaining: 100 }, sickLeave: { hours: 0, remaining: 120 } },
  { id: "3", name: "Wade Warren", avatarColor: "bg-yellow-600", salary: "$2,000/year", paidTimeOff: { hours: 74, remaining: 36 }, paidHoliday: { hours: 0, remaining: 70 }, sickLeave: { hours: 0, remaining: 120 } },
  { id: "4", name: "Jacob Jones", avatarColor: "bg-amber-600", salary: "$556,000/year", paidTimeOff: { hours: 0, remaining: 100 }, paidHoliday: { hours: 40, remaining: 60 }, sickLeave: { hours: 24, remaining: 96 } },
  { id: "5", name: "Jenny Wilson", avatarColor: "bg-blue-500", salary: "$1,234,000/year", paidTimeOff: { hours: 64, remaining: 36 }, paidHoliday: { hours: 0, remaining: 100 }, sickLeave: { hours: 0, remaining: 120 } },
  { id: "6", name: "Rudolp Wayne", avatarColor: "bg-red-500", salary: "$32,000/year", paidTimeOff: { hours: 100, remaining: 0 }, paidHoliday: { hours: 67, remaining: 33 }, sickLeave: { hours: 0, remaining: 12 } },
  { id: "7", name: "Jennifer Kwok", avatarColor: "bg-orange-400", salary: "", paidTimeOff: { hours: 0, remaining: 0 }, paidHoliday: { hours: 100, remaining: 0 }, sickLeave: { hours: 56, remaining: 0 } },
];

export default function Step3TimeOff({ onNext, onPrevious, onCancel }: Step3TimeOffProps) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2C2C2C] mb-1">Time Off</h2>
        <p className="text-sm text-gray-500">Check employe total hours, time off and addtional earning</p>
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
                  <div>
                    <p className="text-sm font-medium text-[#2C2C2C]">{employee.name}</p>
                    <p className="text-xs text-gray-400">FTE · {employee.salary}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="text" 
                      value={employee.paidTimeOff.hours}
                      readOnly
                      className="w-16 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-[#F7D046]"
                    />
                    <span className="text-xs text-gray-400">hrs</span>
                  </div>
                  <p className="text-xs text-gray-400">{employee.paidTimeOff.remaining} hrs remaining</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="text" 
                      value={employee.paidHoliday.hours}
                      readOnly
                      className="w-16 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-[#F7D046]"
                    />
                    <span className="text-xs text-gray-400">hrs</span>
                  </div>
                  <p className="text-xs text-gray-400">{employee.paidHoliday.remaining} hrs remaining</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="text" 
                      value={employee.sickLeave.hours}
                      readOnly
                      className="w-16 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-[#F7D046]"
                    />
                    <span className="text-xs text-gray-400">hrs</span>
                  </div>
                  <p className="text-xs text-gray-400">{employee.sickLeave.remaining} hrs remaining</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
}
