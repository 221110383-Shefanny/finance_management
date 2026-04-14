import { useState } from "react";
import { LucideIcon } from "lucide-react";

interface StepIndicatorProps {
  icon: LucideIcon;
  label: string;
  isCompleted: boolean;
  dropdownItems?: string[];
  onItemClick?: (item: string) => void;
}

export function StepIndicatorWithDropdown({
  icon: Icon,
  label,
  isCompleted,
  dropdownItems = [],
  onItemClick,
}: StepIndicatorProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex flex-col items-center flex-1 z-10 relative">
      {/* Step Indicator Button */}
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-10 h-10 rounded-full text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
          isCompleted ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        <Icon className="text-sm font-bold" />
      </div>

      {/* Label */}
      <span className="text-xs text-gray-600 mt-2 text-center">
        {isCompleted ? "Completed" : "In Progress"}
      </span>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-12 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48 max-h-64 overflow-y-auto">
          {dropdownItems.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {dropdownItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      onItemClick?.(item);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-gray-500 text-sm">
              No items to display
            </div>
          )}
        </div>
      )}
    </div>
  );
}
