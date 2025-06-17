
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          
          return (
            <div key={stepNumber} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-accent border-accent text-white' 
                    : isActive 
                    ? 'border-accent text-accent bg-white' 
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{stepNumber}</span>
                  )}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  isActive ? 'text-accent' : 'text-muted-foreground'
                }`}>
                  {stepTitles[index]}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  isCompleted ? 'bg-accent' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
