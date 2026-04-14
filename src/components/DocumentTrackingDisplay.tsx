import { useState } from "react";
import { Card } from "./ui/card";
import { Check, Clock } from "lucide-react";
import { DocumentTracking } from "../utils/documentTracking";

interface DocumentTrackingDisplayProps {
  tracking: DocumentTracking;
}

export function DocumentTrackingDisplay({ tracking }: DocumentTrackingDisplayProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  
  // Use mainSteps if available, otherwise create a single main step from all steps
  const displaySteps = tracking.mainSteps || 
    [{
      id: 'main',
      label: tracking.documentType,
      isCompleted: tracking.steps.every(s => s.isCompleted),
      subSteps: tracking.steps
    }];
  
  // Get sub-steps for the active step
  const activeStepData = activeStep 
    ? displaySteps.find(s => s.id === activeStep)
    : displaySteps[0];

  return (
    <div className="w-full space-y-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
      {/* Header */}
      <div className="space-y-2 border-b border-purple-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900">
              {tracking.documentType}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Document No: <span className="font-mono font-semibold text-purple-700">{tracking.documentNo}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Supplier</p>
            <p className="text-sm font-medium text-gray-800">{tracking.supplierName}</p>
          </div>
        </div>
      </div>

      {/* Progress Line Section - Main Steps */}
      <div className="bg-white rounded-xl border border-purple-200 p-6 shadow-sm">
        <div className="space-y-4">
          {/* Progress Line Container */}
          <div className="relative flex items-start justify-between gap-2">
            {/* Connecting line */}
            {displaySteps.length > 1 && (
              <div
                className="absolute left-5 right-5 h-1 bg-green-300"
                style={{
                  top: "20px",
                  transform: "translateY(-50%)",
                }}
              ></div>
            )}

            {/* Main Steps */}
            {displaySteps.map((mainStep) => (
              <div 
                key={mainStep.id} 
                className="flex flex-col items-center flex-1 z-10 relative w-full"
                onClick={() => setActiveStep(activeStep === mainStep.id ? null : mainStep.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-md ${
                    mainStep.isCompleted
                      ? 'bg-green-500'
                      : 'bg-yellow-400'
                  }`}
                >
                  {mainStep.isCompleted ? (
                    <Check className="text-sm font-bold" />
                  ) : (
                    <Clock className="text-sm font-bold" />
                  )}
                </div>
                <span className="text-xs text-gray-900 mt-3 text-center font-semibold whitespace-normal break-words px-1 max-w-[90px]">
                  {mainStep.label}
                </span>
                <span className="text-xs text-gray-600 mt-1 text-center font-medium">
                  {mainStep.isCompleted ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Steps Detail - Sub Steps */}
      {activeStepData && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">{activeStepData.label} Details</h4>
          {activeStepData.subSteps.map((step, index) => (
            <div key={index} className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    step.isCompleted
                      ? 'bg-green-100 border-green-500 text-green-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {step.isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                {/* Connector line to next step */}
                {index < activeStepData.subSteps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 transition-all ${
                      step.isCompleted ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pt-1">
                <div className="flex items-baseline justify-between gap-4">
                  <h4
                    className={`font-semibold text-sm transition-all ${
                      step.isCompleted
                        ? 'text-green-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all ${
                        step.isCompleted
                          ? 'bg-green-100 text-green-700'
                          : step.date && step.date !== 'N/A'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {step.date}
                    </span>
                  </div>
                </div>
                {step.description && (
                  <p className="text-xs text-gray-600 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      <div className="border-t border-purple-200 pt-4 flex gap-8">
        <div>
          <p className="text-xs text-gray-500 mb-1">Completed Steps</p>
          <p className="text-lg font-bold text-green-600">
            {displaySteps.filter(s => s.isCompleted).length} / {displaySteps.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <p className={`text-lg font-bold ${
            displaySteps.every(s => s.isCompleted)
              ? 'text-green-600'
              : 'text-blue-600'
          }`}>
            {displaySteps.every(s => s.isCompleted) ? 'Complete' : 'In Progress'}
          </p>
        </div>
      </div>
    </div>
  );
}
