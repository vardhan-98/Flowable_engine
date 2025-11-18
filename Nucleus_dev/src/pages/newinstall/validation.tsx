import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  Typography,
  Tooltip,
} from "@mui/material";
import type { NetworkServiceNode, ServiceCharacteristicReadable } from "../../types/ConfigMangerJsonInterface";
import type { RootState } from "../../slices";
import TreeNodeComponent from "./TreeNodeValidate";
import { setTreeData } from '../../slices/configManagerJsonSlices/orderContent/reducer';
import {
  setAttributes,
  setFormData,
  setSelectedAttr,
} from '../../slices/configManagerJsonSlices/itemAttribute/reducer';
const Validate: React.FC = () => {
  const dispatch = useDispatch();
  const [customerName, setCustomerName] = useState("");
  const [site, setSite] = useState("");
  const [gpsServiceRequest, setGpsServiceRequest] = useState("");
  const treeData = useSelector((state: RootState) => state.tree.treeData);
  const attributes = useSelector((state: RootState) => state.attribute.attributes);
  const selectedAttr = useSelector((state: RootState) => state.attribute.selectedAttr);
  console.log("testtest", treeData)
  const handleRowClick = (attr: ServiceCharacteristicReadable) => {
    dispatch(setSelectedAttr(attr));
    dispatch(
      setFormData({
        label: attr.readnames || '',
        value: attr.value || '',
        description: '',
      })
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", borderRadius: 3 }}>

      {/* <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: "#1E1E1E" }}>
        Validate
      </Typography> */}
      <Box display="flex" mb={2}
        sx={{
          borderBottom: "2px solid #E0E0E0",
        }}
      >
        <Typography variant="h6" fontWeight={500} pt={1} pb={1} pr={3} pl={3}>
          Validate
        </Typography>
      </Box>
      <Box p={3}>
        {/* Filter Inputs */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ minWidth: '31%' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Site</InputLabel>
              <Select value={site} onChange={(e) => setSite(e.target.value)} label="Site">
                <MenuItem value="">Select Site</MenuItem>
                <MenuItem value="site1">Site 1</MenuItem>
                <MenuItem value="site2">Site 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ minWidth: '31%' }}>
            <FormControl fullWidth size="small">
              <InputLabel>GPS Service Request ID</InputLabel>
              <Select
                value={gpsServiceRequest}
                onChange={(e) => setGpsServiceRequest(e.target.value)}
                label="GPS Service Request ID"
              >
                <MenuItem value="">Select Request</MenuItem>
                <MenuItem value="req1">Request 1</MenuItem>
                <MenuItem value="req2">Request 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Tables */}
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>

          {/* Left Table */}
          <TableContainer
            component={Paper}
            sx={{
              flex: 1,
              border: "1px solid #E0E0E0",
              borderRadius: 2,
              overflow: "auto",
              overflowY: "auto", // ✅ enables vertical scroll
              maxHeight: 400, // ✅ adjust height (around 10 rows visible)
            }}
          >

            <Table stickyHeader size="small" aria-label="Service order table"
              sx={{
                minWidth: 750,
                tableLayout: "fixed", // keeps equal column widths
                "& th, & td": {
                  whiteSpace: "nowrap", // ✅ prevents line breaks
                  overflow: "hidden", // hides overflowed text
                  textOverflow: "ellipsis", // adds "..." when text is too long
                },
                "& .MuiTableCell-root": {
                  borderBottom: "none !important", // ✅ force remove row lines
                },
                "& .MuiTableRow-root": {
                  borderBottom: "none !important", // ✅ removes faint grid lines too
                }
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: "#F4F4FB" }}>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      backgroundColor: "#F4F4FB", // ✅ needed with stickyHeader
                      position: "sticky",
                      top: 0,
                      zIndex: 2, // ✅ ensures header stays above scrolling content
                    }}
                  >
                    Top Owner
                  </TableCell>
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

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 500,
                      backgroundColor: "#F4F4FB",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    Action
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 400,
                      width: "25%",
                      backgroundColor: "#F4F4FB",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    Created Date
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {treeData.length === 0 ? (
                  <TableRow sx={{ fontSize: "12px" }}>
                    <TableCell
                      colSpan={4}
                      align="left"
                      sx={{ color: "text.secondary", py: 3, }}
                    >
                      Select Item Description
                    </TableCell>
                  </TableRow>
                ) : (
                  treeData.map((rootNode: NetworkServiceNode, idx: number) => (
                    <TreeNodeComponent
                      key={`root-${rootNode.extId}-${idx}`}
                      node={rootNode}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Right Table */}
          <TableContainer
            component={Paper}
            sx={{
              flex: 1,
              border: "1px solid #E0E0E0",
              borderRadius: 2,
              overflow: "auto",
              overflowY: "auto", // ✅ enables vertical scroll
              maxHeight: 400, // ✅ adjust height (around 10 rows visible)
            }}
          >

            <Table stickyHeader size="small" aria-label="Item Attributes table"
              sx={{
                minWidth: 500,
                tableLayout: "fixed", // keeps equal column widths
                "& th, & td": {
                  whiteSpace: "nowrap", // ✅ prevents line breaks
                  overflow: "hidden", // hides overflowed text
                  textOverflow: "ellipsis", // adds "..." when text is too long
                },
                "& .MuiTableCell-root": {
                  borderBottom: "none !important", // ✅ force remove row lines
                },
                "& .MuiTableRow-root": {
                  borderBottom: "none !important", // ✅ removes faint grid lines too
                }
              }}>
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
                    Label
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      backgroundColor: "#F4F4FB",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    Value
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 500,
                      backgroundColor: "#F4F4FB",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    Readonly
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 500,
                      backgroundColor: "#F4F4FB",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    Sensitive Value
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {attributes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{ color: "text.secondary", py: 3 }}
                    >
                      Select Technical Item List
                    </TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attr, idx) => (
                    <TableRow
                      key={idx}
                      hover
                      selected={selectedAttr?.readnames === attr.readnames}
                      onClick={() => handleRowClick(attr)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: idx % 2 === 0 ? "background.paper" : "grey.100",
                      }}
                    >
                      <TableCell
                        sx={{
                          maxWidth: 120,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {attr.readnames}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {attr.value || ""}
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox checked={false} disabled />
                      </TableCell>
                      <TableCell align="center">

                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Footer Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button
            variant="outlined"
            sx={{
              border: "1.5px solid #0099DC",
              color: "#0099DC",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Device Validate
          </Button>
          <Button
            variant="outlined"
            sx={{
              border: "1.5px solid #0099DC",
              color: "#0099DC",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,

            }}
          >
            Start Orchestration
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#0099DC",
              "&:hover": { backgroundColor: "#0097A7" },
              textTransform: "none",
              fontWeight: 500,
              px: 3,
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Validate;