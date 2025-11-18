// Header Component
// Header Props
// interface HeaderProps {
//     sidebarOpen: boolean;
//     setSidebarOpen: (open: boolean) => void;
//  }
// function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
//     return (
//         <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
//             <div className="flex items-center space-x-4">
//                 <button
//                     className="lg:hidden p-2 rounded hover:bg-gray-100"
//                     onClick={() => setSidebarOpen(!sidebarOpen)}
//                     aria-label="Toggle sidebar"
//                 >
//                     <svg
//                         className="w-6 h-6"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth={2}
//                         viewBox="0 0 24 24"
//                     >
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
//                     </svg>
//                 </button>
//             </div>
//             <div className="flex items-center space-x-4">
//                     <div className="flex items-center justify-center space-x-3">
//                         <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
//                             JS
//                         </div>
//                         <div className="min-w-0 flex-1">
//                             <p className="text-black text-sm font-medium truncate">John Smith</p>
//                             <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F4D294] text-gray-800">
//                                 Admin
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//         </header>
//     );
// }

// export default Header;

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Paper,
} from "@mui/material";
import React, { useState, useRef } from "react";
import NucleusLogo from "../../assets/svg/Nucleus_New_Logo.svg?react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { logoutUser } from "../../slices/auth/login/thunk";

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // localStorage.removeItem("authToken");
    // dispatch(logoutUser());
    navigate("/login");
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    clearCloseTimer();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    clearCloseTimer();
    setAnchorEl(null);
  };

  const handleMenuCloseDelayed = () => {
    closeTimerRef.current = setTimeout(() => {
      setAnchorEl(null);
    }, 200);
  };

  const handleMenuMouseEnter = () => {
    clearCloseTimer();
  };

  const open = Boolean(anchorEl);

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "2px solid #1183C6",
        px: 2,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left - Logo */}
        <Typography>
          <NucleusLogo />
        </Typography>

        {/* Right - User Info */}
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          onMouseEnter={handleMenuOpen}
          onMouseLeave={handleMenuCloseDelayed}
          sx={{ cursor: "pointer" }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#0099DC",
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            A
          </Avatar>
          <Box textAlign="right">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {"admin"}
            </Typography>
            <Chip
              label={"Admin"}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: "#F5D68C",
                color: "#000",
              }}
            />
          </Box>
        </Box>

        {/* Profile Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => { }}
          MenuListProps={{
            onMouseEnter: handleMenuMouseEnter,
            onMouseLeave: handleMenuCloseDelayed,
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 240,
              p: 2,
            },
          }}
          sx={{
            pointerEvents: "none",
            "& .MuiPaper-root": {
              pointerEvents: "auto",
            },
          }}
        >
          <Paper elevation={0} sx={{ textAlign: "center", boxShadow: "none" }}>
            <Avatar
            sx={{
              width: 40,
              height: 40,
              mx: "auto",
              bgcolor: "#0099DC",
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            A
          </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {"admin"}
            </Typography>
            <Chip
              label={"Admin"}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: "#F5D68C",
                color: "#000",
                mt: 0.5,
              }}
            />

            <Divider sx={{ my: 2 }} />

            <Box
              onClick={handleLogout}
              sx={{
                textAlign: "center",
                py: 1,
                px: 2,
                borderRadius: 2,
                border: "1px solid #ccc",
                cursor: "pointer",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              Sign out
            </Box>
          </Paper>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
