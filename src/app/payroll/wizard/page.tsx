"use client";

import { useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import Step1EmployeeSelect from "@/components/payroll/Step1EmployeeSelect";
import Step2TotalHours from "@/components/payroll/Step2TotalHours";
import Step3TimeOff from "@/components/payroll/Step3TimeOff";
import Step4ReviewPayroll from "@/components/payroll/Step4ReviewPayroll";
import Step5Success from "@/components/payroll/Step5Success";

const steps = [
  { number: 1, title: "Pay period & Employee", description: "Select employees and review their working hours" },
  { number: 2, title: "Total Hours", description: "Check employee total hours, time off and additional earning" },
  { number: 3, title: "Time off", description: "Review and adjust time off for employees" },
  { number: 4, title: "Review payroll", description: "Final review before generating salary slips" },
  { number: 5, title: "Success", description: "Payroll generated successfully" },
];

export interface WizardEmployee {
  id: string;
  name: string;
  avatarColor: string;
  hasSalaryStructure: boolean;
  salaryStructureName?: string;
  baseSalary?: number;
  totalHours: number;
  overtime: number;
  additionalEarnings: number;
  additionalEarningsType: string;
  totalPay: number;
  paymentType: string;
  notes: string;
  paidTimeOff: number;
  paidHoliday: number;
  sickLeave: number;
  bankName?: string;
  accountNumber?: string;
}

export interface WizardData {
  selectedEmployees: WizardEmployee[];
  payPeriod: {
    start: string;
    end: string;
  };
  generatedSlips: any[];
}

export default function PayrollWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    selectedEmployees: [],
    payPeriod: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
    },
    generatedSlips: [],
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    window.location.href = "/payroll";
  };

  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  };

  const updateEmployees = (employees: WizardEmployee[]) => {
    setWizardData((prev) => ({ ...prev, selectedEmployees: employees }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back arrow and title */}
          <div className="flex items-center gap-4">
            <Link href="/payroll" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-serif text-black">Run Payroll</h1>
          </div>

          {/* Right side - Pay Period Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-gray-500 font-medium">Pay period:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={wizardData.payPeriod.start}
                onChange={(e) => updateWizardData({ 
                  payPeriod: { ...wizardData.payPeriod, start: e.target.value } 
                })}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#F7D046] cursor-pointer"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={wizardData.payPeriod.end}
                onChange={(e) => updateWizardData({ 
                  payPeriod: { ...wizardData.payPeriod, end: e.target.value } 
                })}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#F7D046] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Left Sidebar - Vertical Stepper */}
        <div className="w-64 border-r border-gray-100 min-h-screen p-6">
          <div className="space-y-1">
            {steps.map((step, index) => (
              <div key={step.number}>
                {/* Step Item */}
                <div className="flex items-start gap-3 py-3">
                  {/* Step Number Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 transition-all ${
                      currentStep === step.number
                        ? "bg-[#F7D046] text-black"
                        : currentStep > step.number
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.number ? "✓" : step.number}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 pt-0.5">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.number ? "text-black" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="ml-4 h-6 w-0.5">
                    <div
                      className={`h-full transition-all ${
                        currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                      }`}
                      style={{ marginLeft: "0.875rem" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {currentStep === 1 && (
              <Step1EmployeeSelect
                onNext={handleNext}
                onCancel={handleCancel}
                onEmployeesSelected={updateEmployees}
                payPeriod={wizardData.payPeriod}
              />
            )}
            {currentStep === 2 && (
              <Step2TotalHours
                employees={wizardData.selectedEmployees}
                onUpdateEmployees={updateEmployees}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onCancel={handleCancel}
              />
            )}
            {currentStep === 3 && (
              <Step3TimeOff
                employees={wizardData.selectedEmployees}
                onUpdateEmployees={updateEmployees}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onCancel={handleCancel}
              />
            )}
            {currentStep === 4 && (
              <Step4ReviewPayroll
                employees={wizardData.selectedEmployees}
                payPeriod={wizardData.payPeriod}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onCancel={handleCancel}
                onSlipsGenerated={(slips) => updateWizardData({ generatedSlips: slips })}
              />
            )}
            {currentStep === 5 && (
              <Step5Success 
                employees={wizardData.selectedEmployees}
                generatedSlips={wizardData.generatedSlips}
                onPrevious={handlePrevious}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
