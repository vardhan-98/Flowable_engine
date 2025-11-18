// File: src/components/ConfigManagerJson/MiddleColumn.tsx
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  Grid,
  TableContainer, // ✅ correct import for MUI v5
} from "@mui/material";
import { styled } from "@mui/system";
import type { RootState } from "../../slices";
import type { NetworkServiceNode } from "../../types/ConfigMangerJsonInterface";
import useConfigManagerJsonService from "../../hooks/ConfigManagerJsonService";
import TreeNodeComponent from "./TreeNode";
// import { grey } from "@mui/material/colors";

// const StyledTableContainer = styled(Box)(({ theme }) => ({
//   border: "1px solid #D1D5DB",
//   borderRadius: "6px",
//   maxHeight: "320px",
//   overflowY: "auto",
//   backgroundColor: "#fff", 
// }));

const MiddleColumn: React.FC = () => {
  const treeData = useSelector((state: RootState) => state.tree.treeData);
  const { deviceActivation, loading } = useConfigManagerJsonService();

  return (
    <Paper
      elevation={2}
      sx={{
        bgcolor: "white",
        borderRadius: 1,
        transition: "all 0.3s ease",
        height: '100%'
      }}
    >
      {/* <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          borderRadius: "4px",
          border: '1px, grey',
          p:1,
        }}
      >
        Order Content
      </Typography> */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          borderBottom: "2px solid #E0E0E0", // 👈 bottom line
          borderRadius: "4px",
          pl: 2,
          pr: 2,
          pt: 1,
          pb: 1
        }}
      >
        Order Content
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          // bgcolor: "#F2F9FD",
          p: 1.2,
          fontWeight: 600,
          borderRadius: "4px",
        }}
      >
        Technical Item List
      </Typography>

      {/* Order Information Form */}
      <Grid container spacing={2} mb={2} sx={{ pl: 2, pr: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Order ID"
            placeholder="Enter Order ID"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Order Type"
            placeholder="Enter Order Type"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Order State"
            placeholder="Enter Order State"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Last Modified By"
            placeholder="User Name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Last Modified Date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Table Section */}
      {/* <StyledTableContainer> */}
      <Box sx={{
        pr: 2,
        pl: 2
      }}>
        {/* <TableContainer sx={{
          border: "1px solid #D1D5DB",
          borderRadius: "6px",
          maxHeight: "320px",
          backgroundColor: "#fff",
        }}
        >
          <Table stickyHeader size="small" aria-label="Service order table">
            <TableHead sx={{ bgcolor: "#F4F4FB !important" }}>
              <TableRow sx={{ bgcolor: "#F4F4FB !important" }}>
                <TableCell sx={{ fontWeight: 500, width: "20%" }}>
                  Top Owner
                </TableCell>
                <TableCell sx={{ fontWeight: 500, width: "40%" }}>
                  Item Description
                </TableCell>
                <TableCell sx={{ fontWeight: 500, width: "25%" }}>
                  Created Date
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 500, width: "15%" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {treeData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ color: "text.secondary", py: 3 }}
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
        </TableContainer> */}
        <TableContainer
          sx={{
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            maxHeight: 320,
            backgroundColor: "#fff",
            overflow: "auto", // ✅ ensures header doesn’t get clipped
          }}
        >
          <Table stickyHeader size="small" aria-label="Service order table">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F4F4FB" }}>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    // width: "20%",
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
                    // width: "40%",
                    backgroundColor: "#F4F4FB",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  Item Description
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    width: "25%",
                    backgroundColor: "#F4F4FB",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  Created Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 500,
                    // width: "15%",
                    backgroundColor: "#F4F4FB",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {treeData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ color: "text.secondary", py: 3 }}
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


      </Box>
      {/* </StyledTableContainer> */}

      {/* Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 2,
          gap: 1,
          p: 2
        }}
      >
        <Button
          variant="outlined"
          sx={{
            color: "#0099DC",
            borderColor: "#0099DC",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        >
          Add NM Profile
        </Button>

        <Button
          variant="outlined"
          sx={{
            color: "#0099DC",
            borderColor: "#0099DC",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        >
          Preview
        </Button>

        <Button
          variant="outlined"
          sx={{
            color: "#0099DC",
            borderColor: "#0099DC",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        >
          Validate
        </Button>

        <Button
          variant="contained"
          onClick={deviceActivation}
          disabled={loading}
          sx={{
            bgcolor: loading ? "grey.400" : "#0099DC",
            textTransform: "none",
            fontSize: "0.75rem",
            "&:hover": { bgcolor: "#007bbd" },
          }}
        >
          {loading ? "Processing..." : "Device Activation"}
        </Button>
      </Box>
    </Paper>
  );
};

export default MiddleColumn;
