import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
// import { Upload } from "lucide-react";

export interface UploadStepProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
}

const UploadNmProfile: React.FC<UploadStepProps> = ({ file, onFileChange }) => {
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        onFileChange(selectedFile || null);
    };

    return (
        <Box>
            <Box display="flex"
                sx={{
                    borderBottom: "2px solid #E0E0E0",
                }}
            >
                <Typography variant="h6" fontWeight={500} pt={1} pb={1} pr={3} pl={3}>
                    Upload NM Profile
                </Typography>
            </Box>
            {/* <Typography variant="h5" fontWeight={600} mb={3}>
                Upload NM Profile
            </Typography> */}
            <Box
                sx={{
                    maxHeight: "calc(100vh - 150px)",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    p: 3,
                    // pr: 3,
                    // pl: 3,
                    "&::-webkit-scrollbar": { width: 8 },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#ccc",
                        borderRadius: 4,
                    },
                }}
            >
                <Paper
                    variant="outlined"
                    sx={{
                        p: 6,
                        textAlign: "center",
                        border: "2px dashed #0099DC",
                        bgcolor: "grey.50",
                    }}
                >
                    {/* <Upload size={48} color="#1976d2" /> */}
                    <Typography variant="subtitle1" fontWeight={500} mt={2}>
                        Upload NM Profile
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Drag & drop your file here or click below to browse
                    </Typography>

                    {/* <Button variant="contained" component="label" sx={{ mt: 1 }}>
                        Upload JSON
                        <input
                            hidden
                            type="file"
                            accept=".csv,.xlsx,.json"
                            onChange={handleFileSelect}
                        />
                    </Button> */}
                    <Button
                        variant="contained"
                        component="label"
                        sx={{ mt: 1, bgcolor: "#0099DC" }}
                    >
                        Upload JSON
                        <input
                            hidden
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                        />
                    </Button>
                    {file && (
                        <Typography variant="body2" color="primary" fontWeight={500} mt={2}>
                            Selected: {file.name}
                        </Typography>
                    )}

                    <Box mt={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#0099DC !important",
                                color: "#fff !important",
                                "&:hover": {
                                    backgroundColor: "#007CBD !important"
                                },
                                "&.Mui-disabled": {
                                    backgroundColor: "#0099DC !important",
                                    color: "#fff !important",
                                    opacity: 0.6
                                }
                            }}
                           
                        >
                            Submit
                        </Button>


                        {/* <Button
                                                variant="contained"
                                                onClick={handleUploadSubmit}
                                                sx={{bgcolor: "#0099DC" }}
                                                disabled={!uploadedFile.file || loading}
                                            >
                                                {loading ? "Uploading..." : "Submit"}
                                            </Button> */}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default UploadNmProfile;



