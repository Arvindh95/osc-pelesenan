import React from 'react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

/**
 * StepIndicator Component
 * Displays wizard progress with step numbers and labels
 * Shows completed, current, and upcoming steps
 * 
 * @param steps - Array of step labels
 * @param currentStep - Current step index (0-based)
 */
const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol
        role="list"
        className="flex items-center justify-center space-x-4 md:space-x-8"
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <div
                  className={`hidden md:block w-16 lg:w-24 h-0.5 mx-4 ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-hidden="true"
                />
              )}
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600'
                      : isCurrent
                      ? 'bg-white border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="w-6 h-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs md:text-sm font-medium text-center max-w-[80px] md:max-w-none ${
                    isCurrent
                      ? 'text-blue-600'
                      : isCompleted
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
