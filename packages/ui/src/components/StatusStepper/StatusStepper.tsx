export interface StatusStepperProps {
  steps: string[];
  currentStep: number;
}

export function StatusStepper({ steps, currentStep }: StatusStepperProps) {
  return (
    <div className="d-flex align-items-center">
      {steps.map((step, i) => (
        <div key={i} className="d-flex align-items-center flex-grow-1">
          <div
            className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
              i <= currentStep ? 'bg-primary text-white' : 'bg-secondary text-white'
            }`}
            style={{ width: 28, height: 28, fontSize: 12 }}
          >
            {i < currentStep ? '✓' : i + 1}
          </div>
          <span className="ms-2 small">{step}</span>
          {i < steps.length - 1 && (
            <div
              className={`flex-grow-1 mx-2 border-top ${
                i < currentStep ? 'border-primary' : 'border-secondary'
              }`}
              style={{ minWidth: 20 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
