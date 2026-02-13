import React from "react";
import { CheckCircle, Circle, Clock, XCircle } from "lucide-react";

interface JourneyStage {
  name: string;
  status: "completed" | "current" | "pending" | "rejected";
  date?: string | null;
}

interface ApplicantJourneyTrackerProps {
  journey: JourneyStage[];
}

export default function ApplicantJourneyTracker({ journey }: ApplicantJourneyTrackerProps) {
  return (
    <div className="flex items-start">
      {journey.map((stage, index) => (
        <React.Fragment key={stage.name}>
          {/* Stage Icon and Name Container */}
          <div className="flex flex-col items-center gap-2 group relative w-20">
            <div
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all shadow-sm border-2 z-10 ${
                stage.status === "completed"
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : stage.status === "current"
                  ? "bg-amber-500 border-amber-500 text-white animate-pulse"
                  : stage.status === "rejected"
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-white border-gray-200 text-gray-300"
              }`}
            >
              {stage.status === "completed" ? (
                <CheckCircle size={16} strokeWidth={2.5} />
              ) : stage.status === "current" ? (
                <Clock size={16} strokeWidth={2.5} />
              ) : stage.status === "rejected" ? (
                <XCircle size={16} strokeWidth={2.5} />
              ) : (
                <Circle size={10} strokeWidth={3} />
              )}
            </div>
            
            {/* Stage Name Label */}
            <div className="h-8 flex items-start justify-center">
              <span className={`text-[8px] font-bold uppercase tracking-tight text-center leading-tight break-words px-1 ${
                stage.status === "completed" ? "text-emerald-600" :
                stage.status === "current" ? "text-amber-600" :
                stage.status === "rejected" ? "text-red-600" :
                "text-gray-400"
              }`}>
                {stage.name}
              </span>
            </div>

            {/* Tooltip for Date */}
            {stage.date && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                {new Date(stage.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>

          {/* Connector Line */}
          {index < journey.length - 1 && (
            <div
              className={`h-0.5 min-w-[40px] flex-grow mt-4 -mx-5 rounded-full transition-all ${
                stage.status === "completed"
                  ? "bg-emerald-500"
                  : stage.status === "rejected"
                  ? "bg-red-500"
                  : "bg-gray-100"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
