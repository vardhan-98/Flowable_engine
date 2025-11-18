import React, { useEffect, useState, useMemo } from "react";
import { CiFilter } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";
import PaginationItem from "@mui/material/PaginationItem";
import NucleusLogo from "../../assets/svg/Nucleus_New_Logo.svg?react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  TableSortLabel,
  MenuItem,
  Select,
  Typography,
  FormControl,
  IconButton,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices";
import { fetchDevices } from "../../slices/devices/thunk";
import type { Device } from "../../types/Devices";


interface DevicesTableProps {
  onUploadClick: () => void;
  onAddClick: () => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

// const DevicesTable: React.FC<DevicesTableProps> = ({ onUploadClick, onAddClick }) => {
const DevicesTable: React.FC<DevicesTableProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { devices, loading } = useSelector((state: RootState) => state.devices);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    dispatch(fetchDevices());
    console.log(dispatch(fetchDevices()))
  }, [dispatch]);

  useEffect(() => {
    setPage(1); // reset pagination when data changes
  }, [devices]);

  const paginatedRows = useMemo(() => {
    if (!Array.isArray(devices)) return [];
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return devices.slice(startIndex, endIndex);
  }, [page, pageSize, devices]);

  const totalPages = Array.isArray(devices) && devices.length > 0
    ? Math.ceil(devices.length / pageSize)
    : 1;

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const [orderBy, setOrderBy] = useState<keyof Device>("masterIdentifier");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (column: keyof Device) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const sortedRows = [...paginatedRows].sort((a, b) => {
    let valA = a[orderBy];
    let valB = b[orderBy];

    // Ensure string comparison works
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });



  return (
    <Box>
      {/* Header */}
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
          Devices
        </Typography>
        <Typography variant="subtitle2" sx={{ color: "#666", "& span": { color: "#2EAAE0" } }}>
          Devices / <span>Devices Table</span>
        </Typography>
      </Box>

      {/* Main Card */}
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #e5e9f2",
          borderRadius: 2,
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
          p: 2
        }}
      >
        {/* Controls */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "flex-end",
            alignItems: { xs: "flex-end", sm: "center" },
            gap: 2,
            pb: 2
          }}
        >
          {/* Buttons */}
          {/* <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: "#0099DC",
                color: "#0099DC",
                textTransform: "none",
                fontSize: { xs: "12px", sm: "14px" },
              }}
              onClick={onUploadClick}
            >
              Upload Device
            </Button> */}

            {/* <Button
              variant="outlined"
              sx={{
                borderColor: "#0099DC",
                color: "#0099DC",
                textTransform: "none",
                fontSize: { xs: "12px", sm: "14px" },
              }}
              onClick={onAddClick}
            >
              Add Device
            </Button>
          </Box> */}

          {/* Search + Filter */}
          <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <TextField
              size="small"
              placeholder="Search"
              fullWidth
              variant="outlined"
              InputProps={{
                sx: {
                  height: 38,
                  "& fieldset": { borderColor: "#dce3ed" },
                  "&:hover fieldset": { borderColor: "#a7c8f5" },
                },
              }}
            />
            <IconButton
              sx={{
                color: "#D78125",
                border: "1px solid #967D20",
                borderRadius: 2,
                p: "6px",
              }}
            >
              <CiFilter size={20} />
            </IconButton>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          sx={{
            maxHeight: 440,
            border: "1px solid #e5e9f2",
            borderRadius: "10px",
            overflow: "auto",
          }}

        >
          <Table stickyHeader
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#f8fbff",
                  "& th": {
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#000000",
                    backgroundColor: "#F4F4FB",
                    borderBottom: "1px solid #e5e9f2",
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableCell sortDirection={orderBy === "masterIdentifier" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "masterIdentifier"}
                    direction={orderBy === "masterIdentifier" ? order : "asc"}
                    onClick={() => handleSort("masterIdentifier")}
                  >
                    Hostname
                  </TableSortLabel>
                  {/* Hostname */}
                </TableCell>
                {/* <TableCell>Device Type</TableCell> */}
                {/* <TableCell>OS Version</TableCell> */}
                <TableCell sortDirection={orderBy === "osVersion" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "osVersion"}
                    direction={orderBy === "osVersion" ? order : "asc"}
                    onClick={() => handleSort("osVersion")}
                  >
                    OS Version
                  </TableSortLabel>
                </TableCell>
                {/* <TableCell>Serial Number</TableCell> */}
                <TableCell sortDirection={orderBy === "serialNumber" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "serialNumber"}
                    direction={orderBy === "serialNumber" ? order : "asc"}
                    onClick={() => handleSort("serialNumber")}
                  >
                    Serial Number
                  </TableSortLabel>
                </TableCell>
                {/* <TableCell>Model</TableCell> */}
                <TableCell sortDirection={orderBy === "description" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "description"}
                    direction={orderBy === "description" ? order : "asc"}
                    onClick={() => handleSort("description")}
                  >
                    Model
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                    {/* <NucleusLogo  style={{ animation: "spin 2s linear infinite" }} /> */}
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows
                  .filter(device => device.status === "SUCCESS" || device.status === "PENDING")
                  .map((device, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        "&:hover": { backgroundColor: "#f6faff" },
                        "&:nth-of-type(odd)": { backgroundColor: "#ffffff" },
                        "&:nth-of-type(even)": { backgroundColor: "#f9fbfd" },
                        "& td": {
                          borderBottom: "1px solid #eef2f7",
                          fontSize: "13px",
                          color: "#394150",
                          py: 1,
                        },
                      }}
                    >
                      <TableCell>{device.masterIdentifier}</TableCell>
                      {/* <TableCell>{device.deviceType}</TableCell> */}
                      <TableCell>{device.osVersion}</TableCell>
                      <TableCell>{device.serialNumber}</TableCell>
                      <TableCell>{device.description}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          sx={{
                            borderColor: "#E91E1E",
                            color: "#E91E1E",
                            textTransform: "none",
                            fontSize: { xs: "12px", sm: "13px" },
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "8px",
                            minWidth: "32px",
                          }}
                        >
                          <RiDeleteBin6Line />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
            
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            pb: 2,
            bgcolor: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography sx={{ mr: 2, fontSize: "14px", color: "#4a5568" }}>
              Rows per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 70 }}>
              <Select
                value={pageSize.toString()}
                onChange={(e: SelectChangeEvent) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                sx={{
                  height: 30,
                  "& fieldset": { borderColor: "#dce3ed" },
                  "&:hover fieldset": { borderColor: "#a7c8f5" },
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <MenuItem key={size} value={size.toString()}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            shape="rounded"
            renderItem={(item) => (
              <PaginationItem
                {...item}
                components={{
                  previous: () => <>‹ Back</>,
                  next: () => <>Next ›</>,
                  first: () => <>« First</>,
                  last: () => <>Last »</>,
                }}
              />
            )}
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: "6px",
                border: "1px solid #E9E9E9",
                color: "#313131",
                fontSize: "14px",
                cursor: "pointer",
                px: 1,
              },
              "& .Mui-selected": {
                backgroundColor: "#0099DC !important",
                color: "#fff !important",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DevicesTable;