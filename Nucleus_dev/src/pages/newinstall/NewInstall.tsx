
import React from "react";
import { Box, Paper, Divider, Button, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import ServiceOrderStep from "./ServiceOrderStep";
import type { StepConfig } from "../../types/NewInstall";
import type { AppDispatch, RootState } from "../../slices";
import { setActiveStep, setUploadedFile } from "../../slices/newInstall/reducer";
import UploadStep from "./UploadSdsJson";
import StepperSidebar from "./NewInstallStepper";
import UploadNmProfile from "./UploadNmProfile";
import Validate from "./validation";

const steps: StepConfig[] = [
  { id: "service-order", label: "Service Order Creation" },
  { id: "upload-nm-profile", label: "Upload NM Profile" },
  { id: "upload-sds", label: "Upload SDS JSON" },
  { id: "Validation", label: "Validation" },
  { id: "stage-0", label: "Stage 0" },
  { id: "stage-1", label: "Stage 1" },
  { id: "completed", label: "Completed" },
];

const ActivationWorkflow: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { uploadedFile, activeStep } = useSelector(
    (state: RootState) => state.activation
  );

  const handleFileChange = (file: File | null) =>
    dispatch(setUploadedFile(file));

  const handleStepClick = (index: number) => dispatch(setActiveStep(index));

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          // <ServiceOrderStep formData={formData} onChange={handleFormChange} />
          <ServiceOrderStep/>
        );
      case 1:
        return (
          <UploadNmProfile file={uploadedFile.file} onFileChange={handleFileChange} />
        );
      case 2:
        return (
          <UploadStep />
        );
      case 3:
        return (
          <Validate />
        );
      default:
        return (
          <Box textAlign="center" py={8}>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                borderRadius: "50%",
                bgcolor: "success.light",
                color: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* <Check size={40} /> */}
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {steps[activeStep]?.label || "Step"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This step is under construction
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500, color: "#333" }}>
          {steps[activeStep]?.label}
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{ color: "#666", "& span": { color: "#2EAAE0" } }}
        >
          New Activation / <span>{steps[activeStep]?.label}</span>
        </Typography>
      </Box>
      <Box display="flex">
        <StepperSidebar
          steps={steps}
          activeStep={activeStep}
          onStepClick={handleStepClick}
        />
        <Box flex={1} pl={2}>
          <Paper sx={{ minHeight: "80vh" }}>
            {renderStepContent()}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ActivationWorkflow;


