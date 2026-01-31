"use client";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  urgency: "urgent" | "normal";
}

export default function RequiredActions() {
  const actions: ActionItem[] = [
    {
      id: "1",
      title: "Approve 3 employee",
      description: "timesheet for payroll on Jul 01st - 30th",
      dueDate: "Jul 01st - 30th",
      urgency: "urgent"
    },
    {
      id: "2",
      title: "Approve 1 Contractor",
      description: "timesheet for payroll on Jul 01st - 30th",
      dueDate: "Jul 01st - 30th",
      urgency: "urgent"
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-xl font-bold text-[#2C2C2C] font-sans mb-6">Required action impacting payroll</h2>
      
      <div className="space-y-4">
        {actions.map((action) => (
          <div 
            key={action.id} 
            className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50/30 rounded-r-lg"
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#2C2C2C] font-sans mb-1">
                {action.title} <span className="font-normal">{action.description}</span>
              </p>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
              Urgent
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
