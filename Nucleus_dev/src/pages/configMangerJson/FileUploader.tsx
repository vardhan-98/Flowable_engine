import { ChangeEvent, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaPlus } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { AiOutlineDisconnect } from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
// import { IoIosAdd } from "react-icons/io";
import { IoAdd } from "react-icons/io5";
import {
  setFile,
  setUploadedFiles,
} from "../../slices/configManagerJsonSlices/fileUploader/reducer";
import {
  setExpandedIds,
  setSelectedRow,
  setTreeData,
} from "../../slices/configManagerJsonSlices/orderContent/reducer";
import {
  setServiceName,
  setSite,
} from "../../slices/configManagerJsonSlices/servicesSearch/reducer";
import type { RootState } from "../../slices";
import useConfigManagerJsonService from "../../hooks/ConfigManagerJsonService";
import type {
  // TreeNode as TreeNodeType,
  // UploadedFile,
  NetworkServiceFile,
  NetworkServiceNode,
} from "../../types/ConfigMangerJsonInterface";

interface LeftColumnProps {
  col1Collapsed: boolean;
  setCol1Collapsed: (collapsed: boolean) => void;
}

const LeftColumn: React.FC<LeftColumnProps> = ({
  col1Collapsed,
  setCol1Collapsed,
}) => {
  const dispatch = useDispatch();
  const serviceName = useSelector((state: RootState) => state.service.serviceName);
  const site = useSelector((state: RootState) => state.service.site);
  const uploadedFiles = useSelector((state: RootState) => state.file.uploadedFiles);
  const selectedRow = useSelector((state: RootState) => state.tree.selectedRow);
  const { uploadJsonFile, loading, fetchTreeData } = useConfigManagerJsonService();
  const { file } = useSelector((state: RootState) => state.file);
  const [macdOrders, setMacdOrders] = useState<string>('');


  // const assignLevels = (nodes: NetworkServiceNode[], level: number = 0) => {
  //   nodes.forEach((node) => {
  //     node.level = level;
  //     if (node.children?.length) assignLevels(node.children, level + 1);
  //   });
  //   return nodes;
  // };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    dispatch(setFile(selectedFile));
    const uploadSuccess = await uploadJsonFile(selectedFile);
    if (uploadSuccess) {
      const fileName = selectedFile.name.replace(/\s+/g, "_");
      const jsonData: NetworkServiceFile = await fetchTreeData(fileName);
      if (jsonData) {
        const innerTree = jsonData.json || [];
        //const treeWithLevels = assignLevels(innerTree);
        dispatch(setTreeData(innerTree));
        const expanded: Record<string, boolean> = {};
        innerTree.forEach((node) => {
          if (node.children?.length) expanded[node.extId] = false;
        });
        dispatch(setExpandedIds(expanded));
        dispatch(
          setUploadedFiles([
            {
              fileName: jsonData.fileName,
              json: innerTree,
            },
          ])
        );
      }
    }
  };

  const handleEditClick = (fileObj: NetworkServiceFile) => {
    try {
      const innerTree = fileObj.json || [];
      //const treeWithLevels = assignLevels(innerTree);
      dispatch(setTreeData(innerTree));
      const initialExpandedIds: Record<string, boolean> = {};
      innerTree.forEach((node) => {
        if (node.children?.length) initialExpandedIds[node.extId] = false;
      });
      dispatch(setExpandedIds(initialExpandedIds));
    } catch {
      alert("Error parsing JSON file!");
    }
  };

  return (
    <Box display="flex" position="relative" sx={{height: '100%'}}>
      {/* Collapsible panel */}
      <Box
        sx={{
          transition: "all 0.3s ease",
          overflow: "hidden",
          // width: col1Collapsed ? 0 : ,
          opacity: col1Collapsed ? 0 : 1,
          p: col1Collapsed ? 0 : 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 2,
          position: "relative",
        }}
      >
        {!col1Collapsed && (
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Service Name */}
              <Box flex={1}>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Service Name
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <TextField
                    size="small"
                    value={serviceName}
                    onChange={(e) => dispatch(setServiceName(e.target.value))}
                    placeholder="Enter service name"
                    fullWidth
                  />
                  <IconButton
                    size="small"
                    sx={{
                      border: "1px solid #D1D5DB",
                      borderRadius: "6px",
                      padding: "10px",
                      "&:hover": { backgroundColor: "#F4F4FB" },
                    }}
                  >
                    <IoIosSearch />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      borderRadius: "6px",
                      padding: "10px",
                      "&:hover": { backgroundColor: "primary.light" },
                    }}
                  >
                    <IoAdd />
                  </IconButton>
                </Box>
              </Box>

              {/* Site */}
              <Box flex={1}>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Site
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  {/* <FormControl size="small" fullWidth>
                    <Select
                      value={site}
                      onChange={(e: SelectChangeEvent) => dispatch(setSite(e.target.value))}
                    >
                      <MenuItem value="">Select site</MenuItem>
                      <MenuItem value="site1">Site 1</MenuItem>
                      <MenuItem value="site2">Site 2</MenuItem>
                    </Select>
                  </FormControl> */}
                  <TextField
                    size="small"
                    fullWidth
                    value={site}
                    onChange={(e) => dispatch(setSite(e.target.value))}
                    placeholder="Select site"
                  />
                  <IconButton
                    size="small"
                    sx={{
                      border: "1px solid #D1D5DB",
                      borderRadius: "6px",
                      padding: "10px",
                      "&:hover": { backgroundColor: "#F4F4FB" },
                    }}
                  >  
                    <IoIosSearch />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      borderRadius: "6px",
                      padding: "10px",
                      "&:hover": { backgroundColor: "primary.light" },
                    }}
                  >
                    <IoAdd />
                  </IconButton>
                </Box>
              </Box>

              {/* Checkbox */}
              <Box display="flex" alignItems="center" sx={{ padding: '0px !important' }}>
                <Checkbox size="small" />
                <Typography variant="body2">Detail Order View</Typography>
              </Box>
            </Box>

            {/* Uploaded Files Table */}
            <Box>
              {/* <Typography variant="subtitle2" mb={1}>
                Item Description
              </Typography> */}
              {/* <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ maxHeight: 240 }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F3F6F9" }}>
                      <TableCell>Item Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploadedFiles.length === 0 ? (
                      <TableRow>
                        <TableCell align="center" sx={{ fontSize: 12 }}>
                          Please search for an existing service or upload a new
                          configuration to proceed
                        </TableCell>
                      </TableRow>
                    ) : (
                      uploadedFiles.map((fileObj, i) => (
                        <TableRow
                          key={i}
                          hover
                          selected={selectedRow === fileObj.fileName}
                          onClick={() => {
                            handleEditClick(fileObj);
                            dispatch(setSelectedRow(fileObj.fileName));
                          }}
                          sx={{
                            bgcolor:
                              selectedRow === fileObj.fileName
                                ? "primary.light"
                                : i % 2 === 0
                                  ? "background.paper"
                                  : "grey.100",
                            cursor: "pointer",
                          }}
                        >
                          <TableCell sx={{ fontSize: 13 }}>
                            {fileObj.fileName}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer> */}
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  maxHeight: 240,
                  overflow: "auto",
                  mt: 2,
                  mb: 2,
                }}
              >
                <Table stickyHeader size="small" aria-label="Uploaded Files Table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          backgroundColor: "#F4F4FB",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                        }}
                      >
                        Item Description
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {uploadedFiles.length === 0 ? (
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{ fontSize: 12, color: "text.secondary", py: 3 }}
                        >
                          Please search for an existing service or upload a new configuration to
                          proceed
                        </TableCell>
                      </TableRow>
                    ) : (
                      uploadedFiles.map((fileObj, i) => (
                        <TableRow
                          key={i}
                          hover
                          selected={selectedRow === fileObj.fileName}
                          onClick={() => {
                            handleEditClick(fileObj);
                            dispatch(setSelectedRow(fileObj.fileName));
                          }}
                          sx={{
                            bgcolor:
                              selectedRow === fileObj.fileName
                                ? "primary.light"
                                : i % 2 === 0
                                  ? "background.paper"
                                  : "grey.100",
                            cursor: "pointer",
                          }}
                        >
                          <TableCell
                            sx={{
                              fontSize: 13,
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fileObj.fileName}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

            </Box>

            {/* Order / Site Actions */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb:1,
                  fontWeight: 600,
                  borderRadius: "4px",
                }}
              >
                Order/Site Actions
              </Typography>

              <Typography variant="caption" color="text.secondary">
                MACD Orders
              </Typography>

              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                {/* Dropdown */}
                <FormControl size="small" fullWidth>
                  <Select
                    value={macdOrders}
                    displayEmpty
                    onChange={(e) => setMacdOrders(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Select Order</em>
                    </MenuItem>
                    <MenuItem value="Regular MACD">Regular MACDs</MenuItem>
                    <MenuItem value="Connectivity MACD">Connectivity MACD</MenuItem>
                    <MenuItem value="Record Only MACD">Record Only MACD</MenuItem>
                    <MenuItem value="NFX | VNF Upgrade">NFX | VNF Upgrade</MenuItem>
                  </Select>
                </FormControl>

                {/* Add Button */}
                <IconButton
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    border: "1px solid",
                    borderColor: "primary.main",
                    color: "primary.main",
                    borderRadius: "6px",
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                    },
                  }}
                >
                  <GoPlus />
                </IconButton>

                {/* Disconnect Button */}
                <IconButton
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    border: "1px solid",
                    borderColor: "error.main",
                    color: "error.main",
                    borderRadius: "6px",
                    "&:hover": {
                      bgcolor: "error.main",
                      color: "white",
                    },
                  }}
                >
                  <AiOutlineDisconnect />
                </IconButton>
              </Box>
            </Box>

            {/* File Upload */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  // bgcolor: "#F2F9FD",
                  mb: 2,
                  mt: 2,
                  fontWeight: 600,
                  borderRadius: "4px",
                }}
              >
                New Configuration
              </Typography>
              <Button
                variant="contained"
                component="label"
                sx={{
                  backgroundColor: '#0099DC'
                }}
                size="small"
                startIcon={loading ? <CircularProgress size={12} /> : undefined}
              >
                {loading ? "Uploading..." : "Browse..."}
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <Typography
                variant="caption"
                display="block"
                mt={0.5}
                color="text.secondary"
              >
                {file ? `Selected file: ${file.name}` : "No file selected"}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Toggle button when expanded (inside white box) */}
        {!col1Collapsed && (
          <IconButton
            onClick={() => setCol1Collapsed(true)}
            sx={{
              position: "absolute",
              top: 16,
              right: 8,
              border: "1px solid",
              borderColor: "primary.main",
              color: "primary.main",
              bgcolor: "white",
              width: 25,
              height: 25,
              "&:hover": { bgcolor: "primary.main", color: "white" },
            }}
          >
            <IoIosArrowForward size={16} />
          </IconButton>
        )}
      </Box>
      {/* Toggle button when collapsed (outside as vertical tab) */}
      {col1Collapsed && (
        <IconButton
          onClick={() => setCol1Collapsed(false)}
          sx={{
            position: "absolute",
            top: "10px",
            left: 0,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1px solid",
            borderColor: "primary.main",
            color: "primary.main",
            bgcolor: "white",
            boxShadow: 1,
            width: 25,
            height: 25,
            "&:hover": { bgcolor: "primary.main", color: "white" },
            zIndex: 10,
          }}
        >
          <IoIosArrowForward
            size={16}
            style={{
              transform: "rotate(180deg)", // points left when closed
              transition: "transform 0.3s ease",
            }}
          />
        </IconButton>
      )}
    </Box>
  );
};

export default LeftColumn;
