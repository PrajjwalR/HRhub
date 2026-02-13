import { useState } from "react";
import RightSidebar from "../RightSidebar";

interface OvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hours: number) => void;
  employeeName: string;
}

export default function OvertimeModal({ isOpen, onClose, onSave, employeeName }: OvertimeModalProps) {
  const [hours, setHours] = useState<string>("");

  const handleSave = () => {
    const hoursNum = parseFloat(hours) || 0;
    onSave(hoursNum);
    setHours("");
    onClose();
  };

  return (
    <RightSidebar 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Record Overtime"
      description={`Enter the overtime hours worked by ${employeeName}.`}
    >
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">
            Payment Type & Duration
          </label>
          <div className="flex gap-4">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              className="flex-1 px-4 py-4 border border-gray-200 rounded-2xl text-sm font-bold text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#F7D046]/20 focus:border-[#F7D046] transition-all"
            />
            <div className="px-6 py-4 border border-gray-200 rounded-2xl text-sm font-black text-gray-400 bg-gray-50 uppercase flex items-center">
              hrs
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 text-xs font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition-all uppercase tracking-widest border border-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-4 bg-[#F7D046] text-[#2C2C2C] text-xs font-black rounded-2xl hover:bg-[#E5C03E] transition-all shadow-lg uppercase tracking-widest"
          >
            Save Overtime
          </button>
        </div>
      </div>
    </RightSidebar>
  );
}
