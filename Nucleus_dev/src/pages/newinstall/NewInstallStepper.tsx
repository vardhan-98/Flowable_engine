// src/components/ActivationWorkflow/StepperSidebar.tsx
// import React from "react";
// import { Box, Typography, Stepper, Step, StepLabel } from "@mui/material";
// import type { StepConfig } from "../../types/NewInstall";


// interface Props {
//   steps: StepConfig[];
//   activeStep: number;
//   onStepClick: (index: number) => void;
// }

// const StepperSidebar: React.FC<Props> = ({ steps, activeStep, onStepClick }) => {
//   return (
//     <Box
//       sx={{
//         width: 280,
//         bgcolor: "white",
//         borderRight: "1px solid",
//         borderColor: "divider",
//         p: 3,
//       }}
//     >


//       <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
//         {steps.map((step, index) => (
//           <Step key={step.id} completed={false}>
//             <StepLabel
//               onClick={() => onStepClick(index)}
//               sx={{
//                 cursor: "pointer",
//                 "& .MuiStepLabel-label": {
//                   fontWeight: activeStep === index ? 600 : 400,
//                   color: activeStep === index ? "primary.main" : "text.primary",
//                 },
//               }}
//             >
//               {step.label}
//             </StepLabel>
//           </Step>
//         ))}
//       </Stepper>
//     </Box>
//   );
// };

// export default StepperSidebar;

import React from "react";
import { Box, Stepper, Step, StepLabel } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../../slices";
import type { StepConfig } from "../../types/NewInstall";

interface Props {
  steps: StepConfig[];
  activeStep: number;
  onStepClick: (index: number) => void;
}

const StepperSidebar: React.FC<Props> = ({ steps, activeStep, onStepClick }) => {
  const completedSteps = useSelector(
    (state: RootState) => state.activation.completedSteps
  );

  return (
    <Box sx={{ width: 280, bgcolor: "white", borderRight: "1px solid", borderColor: "divider", p: 3 }}>
      <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
        {steps.map((step, index) => (
          <Step key={step.id} completed={completedSteps.includes(index)}>
            <StepLabel
              sx={{
                cursor: "pointer",
                "& .MuiStepLabel-label": {
                  fontWeight: activeStep === index ? 600 : 400,
                  color: activeStep === index ? "primary.main" : "text.primary",
                },
              }}
              onClick={() => onStepClick(index)}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default StepperSidebar;
