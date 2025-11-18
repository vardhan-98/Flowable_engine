import React, { useRef, type ChangeEvent } from "react";
import { Box, Typography, Button, Paper, CircularProgress, Backdrop } from "@mui/material";
import { setActiveStep, setStepCompleted, setUploadedFile } from "../../slices/newInstall/reducer";
import { uploadSdsJsonThunk } from "../../slices/newInstall/thunk";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices";
import useConfigManagerJsonService from "../../hooks/ConfigManagerJsonService";
import { setExpandedIds, setTreeData } from "../../slices/configManagerJsonSlices/orderContent/reducer";
import { setFile, setUploadedFiles } from "../../slices/configManagerJsonSlices/fileUploader/reducer";
import type { NetworkServiceFile } from "../../types/ConfigMangerJsonInterface";
import NucleusLogo from "../../assets/svg/Nucleus_New_Logo.svg?react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// import { Upload } from "lucide-react";

// export interface UploadStepProps {
//     file: File | null;
//     onFileChange: (file: File | null) => void;
// }

const UploadStep: React.FC = () => {

    // const dispatch = useDispatch<AppDispatch>();
    // const fileInputRef = useRef<HTMLInputElement | null>(null);

    // const { uploadedFile, loading, error, message } = useSelector(
    //     (state: RootState) => state.activation
    // );

    const dispatch = useDispatch<AppDispatch>();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");
    const { uploadJsonFile, fetchTreeData } = useConfigManagerJsonService();

    const { uploadedFile, loading, error, message } = useSelector(
        (state: RootState) => state.activation
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        dispatch(setUploadedFile(file));
    };

    // const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    //     const selectedFile = e.target.files?.[0];
    //     if (!selectedFile) return;
    //     dispatch(setFile(selectedFile));
    //     const uploadSuccess = await uploadJsonFile(selectedFile);
    //     if (uploadSuccess) {
    //         const fileName = selectedFile.name.replace(/\s+/g, "_");
    //         const jsonData: NetworkServiceFile = await fetchTreeData(fileName);
    //         if (jsonData) {
    //             const innerTree = jsonData.json || [];
    //             //const treeWithLevels = assignLevels(innerTree);
    //             dispatch(setTreeData(innerTree));
    //             const expanded: Record<string, boolean> = {};
    //             innerTree.forEach((node: { children: string | any[]; extId: string | number; }) => {
    //                 if (node.children?.length) expanded[node.extId] = false;
    //             });
    //             dispatch(setExpandedIds(expanded));
    //             dispatch(
    //                 setUploadedFiles([
    //                     {
    //                         fileName: jsonData.fileName,
    //                         json: innerTree,
    //                     },
    //                 ])
    //             );
    //         }
    //     }
    // };


    const handleUploadSubmit = async () => {
        if (!uploadedFile.file) return;

        try {
            //upload file through thunk
            const res = await dispatch(uploadSdsJsonThunk(uploadedFile.file)).unwrap();
            //Backend returned success → now fetch tree
            const fileName = uploadedFile.file.name.replace(/\s+/g, "_");
            const jsonData: NetworkServiceFile = await fetchTreeData(fileName);
            if (!jsonData) return;
            const innerTree = jsonData.json || [];
            //store tree data
            dispatch(setTreeData(innerTree));
            //expanded nodes
            const expanded: Record<string, boolean> = {};
            innerTree.forEach(
                (node: { children?: any[]; extId: string | number }) => {
                    if (node.children?.length) expanded[node.extId] = false;
                }
            );
            dispatch(setExpandedIds(expanded));
            dispatch(
                setUploadedFiles([
                    {
                        fileName: jsonData.fileName,
                        json: innerTree,
                    },
                ])
            );
            //reset file input
            if (fileInputRef.current) fileInputRef.current.value = "";
            setSnackbarMessage("Upload successfully!");
            setOpenSnackbar(true);
            dispatch(setStepCompleted(2));
            dispatch(setActiveStep(3));
        } catch (err) {
            console.error("Upload failed:", err);
             setSnackbarMessage("Something went wrong!");
            setOpenSnackbar(true);
        }
    };

    return (
        <Box>
            {/* Centered Loading Backdrop */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity={snackbarMessage.includes("successfully") ? "success" : "error"}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
                open={loading}
            >
                <NucleusLogo />
            </Backdrop>
            <Box display="flex"
                sx={{
                    borderBottom: "2px solid #E0E0E0",
                }}
            >
                <Typography variant="h6" fontWeight={500} pt={1} pb={1} pr={3} pl={3}>
                    Upload SDS Json
                </Typography>
            </Box>

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
                        Import SDS Json
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Drag & drop your file here or click below to browse
                    </Typography>

                    {/* <Button variant="contained" component="label" sx={{ mt: 1, bg:"#0099DC" }}>
                        Upload JSON
                        <input
                            hidden
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            ref={fileInputRef}
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
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </Button>


                    {uploadedFile.file && (
                        <Typography variant="body2" mt={1}>
                            Selected: {uploadedFile.file.name}
                        </Typography>
                    )}
                    <Box mt={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleUploadSubmit}
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
                            disabled={!uploadedFile.file || loading}
                        >
                            {loading ? "Uploading..." : "Submit"}
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

            {/* {loading && <CircularProgress size={28} sx={{ mt: 2 }} />}
            {error && (
                <Typography color="error" mt={2}>
                    {error}
                </Typography>
            )}
            {message && (
                <Typography color="success.main" mt={2}>
                    {message}
                </Typography>
            )} */}

        </Box>
    )
}

export default UploadStep