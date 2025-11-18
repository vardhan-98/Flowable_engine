import React, { useState } from "react";
import {
    Box,
    Grid,
    Card,
    Typography,
    Chip,
    Button,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Pagination,
    Tooltip,
    InputAdornment,
    Modal,

} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { PaginationItem } from "@mui/material";
import { FirstPage, LastPage, NavigateBefore, NavigateNext } from "@mui/icons-material";

interface DevicesTableProps {
    onAddClick: () => void;
}

const RosterDetails: React.FC<DevicesTableProps> = (onAddClick) => {
    const [page, setPage] = useState(1);
    const rowsPerPage = 10; // 👈 number of rows to show per page
    const [searchTerm, setSearchTerm] = useState("");
    const [date, setDate] = React.useState(dayjs());
    const [open, setOpen] = useState(false);

    const [open1, setOpen1] = useState(false);
    const [form, setForm] = useState({
        attId: "",
        name: "",
        email: "",
        shift: "",
        task: "",
        role: "",
        skills: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        console.log("Form Submitted:", form);
        setOpen1(false);
    };

    const modalStyle = {
        position: "absolute" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 850,
        bgcolor: "background.paper",
        borderRadius: "12px",
        boxShadow: 24,
        p: 4,
    };

    const data = [
        {
            id: "JD12345",
            name: "John Carter",
            email: "john.carter@verylongdomainname-example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "5",
            role: "MSIM",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "9",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "9",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "9",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "4",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "1",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "hdhddhdh Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Abhilash Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        },
        {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "3",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        }, {
            id: "JD12346",
            name: "Joe Green With A Very Long Name",
            email: "joe.green@example.com",
            shift: "12:00 AM - 8:00 AM",
            task: "5",
            role: "LE",
            skills: ["Upgrade"],
            leaves: "None",
        },
        {
            id: "JD12347",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            shift: "8:00 AM - 4:00 PM",
            task: "6",
            role: "DTAC",
            skills: ["Upgrade", "New Install"],
            leaves:
                "Planned Leave (2025-10-25 - 2025-10-28) - this is a long text to test truncation",
        }
        // add other rows as needed...
    ];
    // filter data based on search input
    const filteredRows = data.filter(
        (row: any) =>
            row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.task.toLowerCase().includes(searchTerm.toLowerCase())


    );
    const paginatedData = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "MSIM":
                return { bg: "#E5D5FA", color: "#7B3FE4" };
            case "DTAC":
                return { bg: "#D7E8FA", color: "#1C6DD0" };
            case "LE":
                return { bg: "#FAD7D7", color: "#D32F2F" };
            default:
                return { bg: "#E0E0E0", color: "#424242" };
        }
    };

    // const getStatusColor = (status: string) => {
    //     switch (status) {
    //         case "active":
    //             return { bg: "#E0F8E0", color: "#2E7D32" };
    //         case "On Break":
    //             return { bg: "#FFF4CC", color: "#ED6C02" };
    //         case "6":
    //             return { bg: "#EEEEEE", color: "#757575" };
    //         default:
    //             return { bg: "#E0E0E0", color: "#424242" };
    //     }
    // };

    const getSkillColor = (skill: string) => {
        switch (skill) {
            case "Upgrade":
                return { bg: "#E3F2FD", color: "#1976D2" };
            case "New Install":
                return { bg: "#E8F5E9", color: "#2E7D32" };
            default:
                return { bg: "#F5F5F5", color: "#424242" };
        }
    };

    // fixed widths for headers (can adjust px values to match design)
    const headerWidths = {
        id: "110px",
        name: "160px",
        email: "220px",
        shift: "150px",
        task: "110px",
        role: "100px",
        skills: "160px",
        leaves: "200px",
        actions: "80px",
    };

    // cell style to truncate text and prevent expansion
    const truncStyle = {
        whiteSpace: "nowrap" as const,
        overflow: "hidden" as const,
        textOverflow: "ellipsis" as const,
    };
    const summaryCardsData = [
        { label: "Devices to be Upgraded Today", value: 100 },
        { label: "Total Devices Upgraded", value: 80 },
        { label: "Total DTACs in System", value: 23 },
        { label: "Total MSIMs in System", value: 7 },
        { label: "Total LEs in System", value: 13 },
    ]
    return (
        <Box sx={{ p: 2 }}>
            <div className="flex justify-between items-center mb-3 p-1 px-3 bg-white border border-gray-200">
                <h5 className="text-[20px] font-semibold text-[#333333]">Process Roster & Configuration Dashboard</h5>
            </div>
            {/* Summary Cards */}

            {/* <Grid
                container
                spacing={2}
                columnSpacing={1}
                mb={2}
                justifyContent="flex-start"
                alignItems="stretch"
            >
                {summaryCardsData.map((item, index) => (
                    <Grid item xs={12} sm={6} md={2.4} key={index} >
                        <Card
                            sx={{
                                p: 2,
                                textAlign: "center",
                                border: "1px solid #00AEEF", // Bright blue border
                                borderRadius: "8px",
                                boxShadow: "none",
                                fontSize: '10px',
                                transition: "all 0.3s ease",
                                justifyContent: 'space-between',
                                "&:hover": {
                                    boxShadow: "0 2px 6px rgba(0, 174, 239, 0.2)",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{ color: "#00AEEF", fontWeight: 500, mb: 0.5 }}
                            >
                                {item.label}
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{ color: "#00AEEF", fontWeight: 600 }}
                            >
                                {item.value}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid> */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 2,
                    width: "100%",
                    mb: 2
                }}
            >
                {summaryCardsData.map((item, index) => (
                    <Card
                        key={index}
                        sx={{
                            p: 2,
                            textAlign: "center",
                            border: "1px solid #00AEEF",
                            borderRadius: "10px",
                            boxShadow: "none",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                boxShadow: "0 4px 10px rgba(0, 174, 239, 0.25)",
                                transform: "translateY(-3px)",
                            },
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ color: "#00AEEF", fontWeight: 500, mb: 0.5 }}
                        >
                            {item.label}
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{ color: "#00AEEF", fontWeight: 700 }}
                        >
                            {item.value}
                        </Typography>
                    </Card>
                ))}
            </Box>

            {/* Filters */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                {/* <TextField select label="All Statuses" size="small" sx={{ minWidth: 150 }}>
                    <MenuItem value="">Select</MenuItem>
                </TextField> */}
                <TextField select label="All Roles" size="small" sx={{ minWidth: 150 }}>
                    <MenuItem value="">Select</MenuItem>
                </TextField>
                <TextField select label="All Skills" size="small" sx={{ minWidth: 150 }}>
                    <MenuItem value="">Select</MenuItem>
                </TextField>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: 250 }}>
                    {/* <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
        Date Range
      </Typography> */}

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {/* <DatePicker
                            value={date}
                            onChange={(newValue: any) => setDate(newValue)}
                            open={open}
                            onClose={() => setOpen(false)}
                            onOpen={() => setOpen(true)}
                            format="DD/MM/YYYY"
                            enableAccessibleFieldDOMStructure={false}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                    onClick: () => setOpen(true), // open when input clicked
                                    InputProps: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setOpen(true)}>
                                                    <CalendarTodayIcon sx={{ color: "gray" }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                    sx: {
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "8px",
                                        },
                                    },
                                },
                            }}
                        /> */}

                        <DatePicker
                            value={date}
                            onChange={(newValue: any) => setDate(newValue)}
                            open={open}
                            onClose={() => setOpen(false)}
                            onOpen={() => setOpen(true)}
                            format="DD/MM/YYYY"
                            enableAccessibleFieldDOMStructure={false}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                    onClick: () => setOpen(true),
                                    InputProps: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setOpen(true)}>
                                                    <CalendarTodayIcon sx={{ color: "gray" }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                    sx: {
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "8px",
                                        },
                                        minWidth: "250px", // ✅ ensures stable width
                                        flexShrink: 0,      // ✅ prevents shrinking inside flex containers
                                    },
                                },
                            }}
                        />

                    </LocalizationProvider>
                </Box>

                <TextField value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search" size="small" sx={{ flex: 1, minWidth: 200 }} InputProps={{
                    endAdornment: (<InputAdornment position="start"> <SearchIcon sx={{ color: "gray" }} /></InputAdornment>),
                }} />
                <Button variant="contained" sx={{ bgcolor: "#2196f3", textTransform: "none" }} onClick={() => setOpen1(true)}>
                    + Create New
                </Button>
                <Box>
                    <Modal open={open1} onClose={() => setOpen1(false)}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "76%",
                                maxWidth: 860,
                                bgcolor: "white",
                                boxShadow: 24,
                                borderRadius: "8px",
                                // p: 4,
                                outline: "none",
                            }}
                        >
                            {/* Header */}
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 3,
                                    fontWeight: 200,
                                    color: "#1E1E1E",
                                    borderBottom: "1px solid #E0E0E0",
                                    // pb: 1,
                                    p: 1
                                }}
                            >
                                Create New Roster
                            </Typography>

                            {/* Form Layout */}
                            <Typography sx={{pl:12}}>
                            <Grid container spacing={3}  >
                                {/* Row 1 */}
                                {/* <Grid item xs={12} sm={6} md={3.0}>
                                    <TextField
                                        label="AT&T ID"
                                        name="attId"
                                        fullWidth
                                        size="small"
                                        value={form.attId}
                                        onChange={handleChange}
                                    />
                                </Grid> */}
                                <Grid item xs={12} sm={6} md={3.0}>
                                    <TextField
                                        label="Employee Name"
                                        name="name"
                                        fullWidth
                                        size="small"
                                        value={form.name}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3.0}>
                                    <TextField
                                        label="Email"
                                        name="email"
                                        fullWidth
                                        size="small"
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3.0}>
                                    <TextField
                                        select
                                        label="Shift Timings"
                                        name="shift"
                                        fullWidth
                                        size="small"
                                        value={form.shift}
                                        onChange={handleChange}
                                        sx={{ minWidth: 210 }}
                                    >
                                        <MenuItem value="12:00 AM - 8:00 AM">12:00 AM - 8:00 AM</MenuItem>
                                        <MenuItem value="8:00 AM - 4:00 PM">8:00 AM - 4:00 PM</MenuItem>
                                        <MenuItem value="4:00 PM - 12:00 AM">4:00 PM - 12:00 AM</MenuItem>
                                    </TextField>
                                </Grid>

                                {/* Row 2 */}
                                <Grid item xs={12} sm={6} md={3.0}>
                                    <TextField
                                        label="Task"
                                        name="task"
                                        fullWidth
                                        size="small"
                                        value={form.task}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3.0}>
                                    <TextField
                                        select
                                        label="Role"
                                        name="role"
                                        fullWidth
                                        size="small"
                                        value={form.role}
                                        onChange={handleChange}
                                        sx={{ minWidth: 210 }}
                                    >
                                        <MenuItem value="MSIM">MSIM</MenuItem>
                                        <MenuItem value="Admin">Admin</MenuItem>
                                        <MenuItem value="Agent">Agent</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3.0}>
                                    <TextField
                                        select
                                        label="Skills"
                                        name="skills"
                                        fullWidth
                                        size="small"
                                        value={form.skills}
                                        onChange={handleChange}
                                        sx={{ minWidth: 210 }}
                                    >
                                        <MenuItem value="Upgrade">Upgrade</MenuItem>
                                        <MenuItem value="Support">Support</MenuItem>
                                        <MenuItem value="Testing">Testing</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>
                            </Typography>

                            {/* Footer */}
                            <Box
                                mt={4}
                                p={1.5}
                                display="flex"
                                justifyContent="flex-end"
                                borderTop="1px solid #E0E0E0"
                                gap={2}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() => setOpen1(false)}
                                    sx={{
                                        px: 3,
                                        borderColor: "#BDBDBD",
                                        color: "#1E88E5",
                                        textTransform: "none",
                                        borderRadius: "6px",
                                        "&:hover": { borderColor: "#1976D2" },
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    sx={{
                                        px: 3,
                                        backgroundColor: "#1976D2",
                                        textTransform: "none",
                                        borderRadius: "6px",
                                        "&:hover": { backgroundColor: "#1565C0" },
                                    }}
                                >
                                    Submit
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                </Box>
            </Box>

            {/* Table: note overflowX:auto and tableLayout:fixed */}
            <TableContainer
                component={Paper}
                sx={{
                    boxShadow: "none",
                    border: "1px solid #E0E0E0",
                    overflowX: "auto", // allow horizontal scroll
                }}
            >
                <Table
                    stickyHeader
                    sx={{
                        minWidth: 900,
                        tableLayout: "fixed", // FIXED layout so widths are respected
                    }}
                >
                    <TableHead>
                        <TableRow sx={{ "& .MuiTableCell-head": { backgroundColor: "#F4F4FB", color: "#000", fontWeight: 600, }, }}>
                            <TableCell sx={{ fontWeight: 600, width: headerWidths.id }}>AT&T ID</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: headerWidths.name }}>Employee Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: headerWidths.email }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: headerWidths.shift }}>Shift Timings</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: headerWidths.task }}>Task</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: headerWidths.role }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: headerWidths.skills }}>Skills</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: headerWidths.leaves }}>Upcoming Leaves</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: headerWidths.actions, textAlign: "center" }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredRows.map((row, i) => (
                            <TableRow
                                key={i}
                                sx={{
                                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }, // light gray for odd rows
                                    '&:nth-of-type(even)': { backgroundColor: '#ffffff' }, // white for even rows
                                    '&:hover': { backgroundColor: '#f1f1ff' }, // light violet hover
                                    transition: 'background-color 0.2s ease',
                                }}
                            >
                                <TableCell sx={truncStyle}>
                                    <Tooltip title={row.id} arrow>
                                        <Box sx={truncStyle}>{row.id}</Box>
                                    </Tooltip>
                                </TableCell>

                                <TableCell sx={{ ...truncStyle, maxWidth: headerWidths.name }}>
                                    <Tooltip title={row.name} arrow>
                                        <Box sx={truncStyle}>{row.name}</Box>
                                    </Tooltip>
                                </TableCell>

                                <TableCell sx={{ ...truncStyle, maxWidth: headerWidths.email }}>
                                    <Tooltip title={row.email} arrow>
                                        <Box sx={truncStyle}>{row.email}</Box>
                                    </Tooltip>
                                </TableCell>

                                <TableCell sx={{ ...truncStyle, maxWidth: headerWidths.shift }}>
                                    <Tooltip title={row.shift} arrow>
                                        <Box sx={truncStyle}>{row.shift}</Box>
                                    </Tooltip>
                                </TableCell>

                                <TableCell sx={{ ...truncStyle, maxWidth: headerWidths.shift }}>
                                    <Tooltip title={row.task} arrow>
                                        <Box sx={truncStyle}>{row.task}</Box>
                                    </Tooltip>
                                </TableCell>
                                {/* Status */}
                                {/* <TableCell>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Tooltip title={row.status} arrow>
                                            <Chip
                                                label={row.status}
                                                sx={{
                                                    bgcolor: getStatusColor(row.status).bg,
                                                    color: getStatusColor(row.status).color,
                                                    borderRadius: '8px',
                                                    fontWeight: 500,
                                                    minWidth: '88px',
                                                    maxWidth: '88px',
                                                    justifyContent: 'center',
                                                    ...{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
                                                }}
                                                size="small"
                                            />
                                        </Tooltip>
                                    </Box>
                                </TableCell> */}

                                {/* Role */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Tooltip title={row.role} arrow>
                                            <Chip
                                                label={row.role}
                                                sx={{
                                                    bgcolor: getRoleColor(row.role).bg,
                                                    color: getRoleColor(row.role).color,
                                                    borderRadius: '8px',
                                                    fontWeight: 500,
                                                    minWidth: '88px',
                                                    maxWidth: '88px',
                                                    justifyContent: 'center',
                                                    ...{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
                                                }}
                                                size="small"
                                            />
                                        </Tooltip>
                                    </Box>
                                </TableCell>

                                {/* Skills */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                                        {row.skills.map((skill, idx) => (
                                            <Tooltip key={idx} title={skill} arrow>
                                                <Chip
                                                    label={skill}
                                                    sx={{
                                                        bgcolor: getSkillColor(skill).bg,
                                                        color: getSkillColor(skill).color,
                                                        borderRadius: '8px',
                                                        fontWeight: 500,
                                                        minWidth: '88px',
                                                        maxWidth: '88px',
                                                        justifyContent: 'center',
                                                        ...{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
                                                    }}
                                                    size="small"
                                                />
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ ...truncStyle, maxWidth: headerWidths.leaves }}>
                                    <Tooltip title={row.leaves} arrow>
                                        <Box sx={truncStyle}>{row.leaves}</Box>
                                    </Tooltip>
                                </TableCell>

                                <TableCell align="center">
                                    <IconButton size="small">
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 3,
                }}
            >

                <Pagination
                    count={Math.ceil(filteredRows.length / rowsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    siblingCount={1}
                    boundaryCount={1}
                    shape="rounded"
                    renderItem={(item) => {
                        const isFirst = item.type === "first";
                        const isLast = item.type === "last";
                        const isPrev = item.type === "previous";
                        const isNext = item.type === "next";

                        return (
                            <PaginationItem
                                {...item}
                                slots={{
                                    first: FirstPage,
                                    last: LastPage,
                                    previous: NavigateBefore,
                                    next: NavigateNext,
                                }}
                                // Add labels beside icons
                                componentsProps={{
                                    previous: {
                                        children: (
                                            <>
                                                <NavigateBefore fontSize="small" /> Back
                                            </>
                                        ),
                                    },
                                    next: {
                                        children: (
                                            <>
                                                Next <NavigateNext fontSize="small" />
                                            </>
                                        ),
                                    },
                                    first: {
                                        children: (
                                            <>
                                                « First
                                            </>
                                        ),
                                    },
                                    last: {
                                        children: (
                                            <>
                                                Last »
                                            </>
                                        ),
                                    },
                                }}
                                sx={{
                                    px: isFirst || isLast || isPrev || isNext ? 1.5 : 0,
                                }}
                            />
                        );
                    }}
                    sx={{
                        "& .MuiPaginationItem-root": {
                            borderRadius: "6px",
                            minWidth: "40px",
                            height: "38px",
                            border: "1px solid #E0E0E0",
                            color: "#333",
                            fontWeight: 500,
                            fontSize: "14px",
                            "&:hover": {
                                backgroundColor: "#E9F6FF",
                            },
                        },
                        "& .MuiPaginationItem-ellipsis": {
                            border: "none",
                        },
                        "& .Mui-selected": {
                            backgroundColor: "#009fe3",
                            color: "#fff",
                            "&:hover": {
                                backgroundColor: "#009fe3",
                            },
                        },
                    }}
                    showFirstButton
                    showLastButton
                />
            </Box>
        </Box>
    );

};



export default RosterDetails;
