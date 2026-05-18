import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: 1 | 2 | 3;
}

export function Stepper({ currentStep }: StepperProps) {
  const steps = [
    { num: 1, label: 'Livraison' },
    { num: 2, label: 'Paiement' },
    { num: 3, label: 'Confirmation' },
  ];

  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, idx) => {
        const isCompleted = step.num < currentStep;
        const isActive = step.num === currentStep;

        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                      ? 'bg-primary text-white' 
                      : 'bg-card-bg border-2 border-card-border text-foreground/50'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.num}
              </div>
              <span className={`text-xs mt-2 font-medium ${isActive || isCompleted ? 'text-foreground' : 'text-foreground/50'}`}>
                {step.label}
              </span>
            </div>
            
            {idx < steps.length - 1 && (
              <div className={`w-20 lg:w-32 h-1 mx-2 -mt-6 rounded-full ${
                step.num < currentStep ? 'bg-green-500' : 'bg-card-border'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
