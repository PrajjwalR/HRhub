import { useState } from "react";
import RightSidebar from "../RightSidebar";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  employeeName: string;
  initialNote?: string;
}

export default function NoteModal({ isOpen, onClose, onSave, employeeName, initialNote = "" }: NoteModalProps) {
  const [note, setNote] = useState(initialNote);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  return (
    <RightSidebar 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Add Note for ${employeeName}`}
      description="Record additional information or special instructions for this employee's payroll."
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any notes about this employee's payroll..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F7D046]/20 focus:border-[#F7D046] transition-all resize-none"
            rows={6}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#F7D046] text-black text-sm font-bold rounded-xl hover:bg-[#E5C03E] transition-all shadow-lg uppercase tracking-widest"
          >
            Save Note
          </button>
        </div>
      </div>
    </RightSidebar>
  );
}
