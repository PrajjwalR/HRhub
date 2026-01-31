"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, Check } from "lucide-react";
import Link from "next/link";
import Step1EmployeeSelect from "@/components/payroll/Step1EmployeeSelect";
import Step2TotalHours from "@/components/payroll/Step2TotalHours";
import Step3TimeOff from "@/components/payroll/Step3TimeOff";
import Step4ReviewPayroll from "@/components/payroll/Step4ReviewPayroll";
import Step5Success from "@/components/payroll/Step5Success";

type Step = 1 | 2 | 3 | 4 | 5;

const steps = [
  { id: 1, title: "Pay period & Employee", description: "Select your employee and review their working hour" },
  { id: 2, title: "Total Hours", description: "Review your employee total working hour" },
  { id: 3, title: "Time Off", description: "Review your employee total time off" },
  { id: 4, title: "Review payroll", description: "Review your payroll total payment" },
  { id: 5, title: "Success", description: "You successfully run your payroll" },
];

export default function RunPayrollPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <div className="border-b border-gray-100 px-8 py-4">
        <div className="flex items-center gap-6">
          <Link 
            href="/payroll"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          
          <h1 className="text-2xl font-serif text-[#2C2C2C]">Run Payroll</h1>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 ml-4 border-l pl-4 border-gray-200">
            <Calendar size={16} />
            <span>Pay period: <span className="font-medium">July 01st - 31st</span></span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar Stepper */}
        <div className="w-72 border-r border-gray-100 p-6 min-h-[calc(100vh-73px)]">
          <div className="space-y-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep > step.id 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-[#F7D046] text-[#2C2C2C]' 
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}>
                    {currentStep > step.id ? <Check size={16} /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-0.5 h-12 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
                
                {/* Step content */}
                <div className="pt-1">
                  <h3 className={`text-sm font-medium ${currentStep >= step.id ? 'text-[#2C2C2C]' : 'text-gray-400'}`}>
                    {step.title}
                  </h3>
                  {currentStep === step.id && step.description && (
                    <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 max-w-[1200px]">
          {currentStep === 1 && (
            <Step1EmployeeSelect 
              onNext={handleNext} 
              onCancel={handleCancel} 
            />
          )}
          
          {currentStep === 2 && (
            <Step2TotalHours 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          
          {currentStep === 3 && (
            <Step3TimeOff 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          
          {currentStep === 4 && (
            <Step4ReviewPayroll 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          
          {currentStep === 5 && (
            <Step5Success 
              onFinish={() => window.location.href = '/payroll'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
