import { useState } from "react";
import { Plus, Check, Clock } from "lucide-react";
import { StepIndicatorWithDropdown } from "./StepIndicatorWithDropdown";

interface StepData {
  id: string;
  icon: any; // LucideIcon type
  label: string;
  isCompleted: boolean;
  items: string[];
}

export function StepProgressExample() {
  // Example steps with dropdown items
  const [steps, setSteps] = useState<StepData[]>([
    {
      id: "po",
      icon: Plus,
      label: "Purchase Order",
      isCompleted: true,
      items: ["PO-001", "PO-002", "PO-003"],
    },
    {
      id: "pi",
      icon: Check,
      label: "Purchase Invoice",
      isCompleted: false,
      items: ["PI-001", "PI-002"],
    },
    {
      id: "payment",
      icon: Clock,
      label: "Payment Status",
      isCompleted: false,
      items: [],
    },
  ]);

  const handleItemClick = (stepId: string, item: string) => {
    console.log(`Clicked: ${stepId} - ${item}`);
    // Handle item selection logic here
  };

  return (
    <div className="w-full bg-white rounded-lg border border-purple-200 p-6">
      <h3 className="text-lg font-semibold mb-6">Document Progress</h3>

      {/* Horizontal Progress Line */}
      <div className="relative flex items-center justify-between mb-8">
        {/* Connection Line */}
        <div className="absolute left-[15%] right-[15%] top-1/2 h-1 bg-gray-300 -z-10"></div>

        {/* Step Indicators */}
        <div className="flex w-full justify-between">
          {steps.map((step) => (
            <StepIndicatorWithDropdown
              key={step.id}
              icon={step.icon}
              label={step.label}
              isCompleted={step.isCompleted}
              dropdownItems={step.items}
              onItemClick={(item) => handleItemClick(step.id, item)}
            />
          ))}
        </div>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        Click on any step indicator to view details
      </p>
    </div>
  );
}
