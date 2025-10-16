import React from 'react';

interface MintProgressStepsProps {
  currentStep: number;
}

const MintProgressSteps: React.FC<MintProgressStepsProps> = ({ currentStep }) => {
  const currentStage = currentStep === 1 ? 'configure' : currentStep === 2 ? 'preview' : 'success';
  const steps = [
    { id: 'configure', label: '1.Configure NFT' },
    { id: 'preview', label: '2.Preview & Network' },
    { id: 'success', label: '3.Minting......' },
  ];

  const getStepStatus = (stepId: string) => {
    if (stepId === currentStage) return 'current';
    return 'inactive';
  };

  return (
    <div className="flex justify-center gap-[62px] mb-8">
      {steps.map((step) => {
        const status = getStepStatus(step.id);

        return (
          <div
            key={step.id}
            className={`
              w-[285px] h-[50px] rounded-[10px] border-2 border-black
              flex items-center justify-center font-bold text-[20px] leading-[1.21]
              ${status === 'current'
            ? 'bg-black text-white'
            : 'bg-white text-black'
          }
            `}
          >
            {step.label}
          </div>
        );
      })}
    </div>
  );
};

export default MintProgressSteps;
