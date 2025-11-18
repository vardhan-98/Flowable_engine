
// import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
// import FormIcon from "../../assets/formlogo.svg";
// import nucleus_logo from "../../assets/nucleus-logo.svg";
// import dashboardlogo from "../../assets/Vector1.svg";
// import { PiLayout } from "react-icons/pi";
// import { BsSliders2 } from "react-icons/bs";
// import { MdOutlinePersonOutline } from "react-icons/md";
// import { SlSettings } from "react-icons/sl";
// import { AiOutlineLogout } from "react-icons/ai";
// import type { useLocation, useNavigate } from "react-router-dom";
// import DeviceIcon from "../../assets/fluent_device-eq-16-regular.svg?react";
// import HomeIcon from "../../assets/homeIcon.svg?react";
// import NewInstallIcon from "../../assets/newInstallIcon.svg?react";



// interface SidebarProps {
//     sidebarOpen: boolean;
//     setSidebarOpen: (open: boolean) => void;
//     expanded: string | null;
//     setExpanded: (expanded: string | null) => void;
//     activeSub: string | null;
//     setActiveSub: (sub: string | null) => void;
//     location: ReturnType<typeof useLocation>;
//     navigate: ReturnType<typeof useNavigate>;
// }

// function Sidebar({
//     sidebarOpen,
//     setSidebarOpen,
//     expanded,
//     setExpanded,
//     activeSub,
//     setActiveSub,
//     location,
//     navigate
// }: SidebarProps) {
//     const menuItems = [
//         {
//             title: 'Home',
//             path: '/dashboard',
//             icon: <HomeIcon className="w-[24px] h-[24px]" />,
//             subItems: [],
//         },
//         {
//             title: 'Devices',
//             path: '/devices',
//             icon: <DeviceIcon className="w-[24px] h-[24px]" />,
//             subItems: [],
//         },
//         {
//             title: 'New Install',
//             path: '/config',
//             icon: <NewInstallIcon className="w-[24px] h-[24px]" />,
//             subItems: [],
//         },
//         {
//             title: 'Order Manager',
//             path: '/order-progress',
//             icon: <BsSliders2 className="w-[24px] h-[24px]" />,
//             subItems: [],
//         },
//         {
//             title: 'Manage NM Profile',
//             path: '',
//             icon: <MdOutlinePersonOutline className="w-[24px] h-[24px]" />,
//             subItems: [
//                 {
//                     title: '',
//                     path: '',
//                 }
//             ],
//         },
//     ];

//     const activeMenu = menuItems.find(item =>
//         location.pathname.startsWith(item.path) && item.path !== ''
//     )?.title || 'ConfigManagerJson'; 

//     return (
//         <aside
//             className={`${sidebarOpen ? 'w-64' : 'w-16'
//                 } bg-[#2FB3ED] border-r border-gray-200 flex flex-col transition-width duration-300`}
//         >
//             <div className={`flex items-center justify-between h-16 border-b border-gray-200 
//         ${sidebarOpen ? "px-2" : "justify-center"}`}>

          
//                 {sidebarOpen ? (
//                     <div className="flex items-center space-x-2 relative">
//                         <img src={nucleus_logo} alt="logo" className="w-12 h-12" />
//                         <span className="text-lg text-white absolute top-[25px] left-[50px]">ucleus</span>
//                     </div>
//                 ) : (
//                     <div className="flex justify-center w-full">
//                         <img src={nucleus_logo} alt="logo" className="w-12 h-12" />
//                     </div>
//                 )}
          
//                 {sidebarOpen && (
//                     <button
//                         onClick={() => setSidebarOpen(!sidebarOpen)}
//                         className="cursor-pointer p-1 rounded hover:bg-gray-200 h-[25px] w-[25px] bg-[#0099DC] rounded-full relative top-8 left-6"
//                         aria-label="Toggle sidebar"
//                     >
//                         <IoIosArrowBack className="text-white" />
//                     </button>
//                 )}
//             </div>

           
//             {!sidebarOpen && (
//                 <button
//                     onClick={() => setSidebarOpen(!sidebarOpen)}
//                     className="cursor-pointer absolute top-13 left-13  p-1 rounded-full bg-[#0099DC] h-[25px] w-[25px] flex items-center justify-center"
//                     aria-label="Toggle sidebar"
//                 >
//                     <IoIosArrowForward className="text-white" />
//                 </button>
//             )}

          
//             <nav className="flex-1 overflow-y-auto">
//                 <ul className="p-2">
//                     {menuItems.map(({ title, icon, subItems, path }) => {
//                         const isExpanded = expanded === title;
//                         const isActive = activeMenu === title;

//                         return (
//                             <li key={title} className="mb-1">
//                                 <button
//                                     onClick={() => {
//                                         setExpanded(isExpanded ? null : title);
//                                         if (path) navigate(path);
//                                     }}
//                                     className={`cursor-pointer flex items-center w-full px-3 py-2 text-left rounded focus:outline-none
//                                         ${isActive ? 'bg-[#77C2E2] text-white' : 'text-[#E0E0E0] hover:bg-gray-100'}
//                                     `}
//                                 >
//                                     <span className={`${isActive ? 'text-white' : 'text-[#E0E0E0]'}`}>
//                                         {icon}
//                                     </span>
//                                     {sidebarOpen && <span className="ml-3 flex-1 text-[15px]">{title}</span>}
//                                     {subItems.length > 0 && sidebarOpen && (
//                                         <svg
//                                             className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`}
//                                             fill="none"
//                                             stroke="currentColor"
//                                             strokeWidth={2}
//                                             viewBox="0 0 24 24"
//                                         >
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//                                         </svg>
//                                     )}
//                                 </button>

                                
//                                 {isExpanded && sidebarOpen && subItems.length > 0 && (
//                                     <ul className="pl-17 mt-1 mb-4 space-y-1 text-sm">
//                                         {subItems.map((sub) => (
//                                             <li key={sub.title}>
//                                                 <button
//                                                     onClick={() => {
//                                                         setActiveSub(sub.title);
//                                                         navigate(sub.path); // 👈 navigates to the sub path
//                                                     }}
//                                                     className={`w-full text-left cursor-pointer
//                                                         ${activeSub === sub.title ? 'text-[#0099DC] font-semibold' : 'text-[#E0E0E0] hover:text-blue-600'}
//                                                     `}
//                                                 >
//                                                     {sub.title}
//                                                 </button>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 )}
//                             </li>
//                         );
//                     })}
//                 </ul>
//             </nav>
//         </aside>
//     );
// }

// export default Sidebar;

import React, { useState, useRef } from "react";
import {
    Box,
    Menu,
    MenuItem as MUIMenuItem,
    Typography,
    useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import type { MenuItem } from "../../types/Menu";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

interface MenuBarProps {
    items: MenuItem[];
}

const MenuBar: React.FC<MenuBarProps> = ({ items}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [subMenuAnchor, setSubMenuAnchor] = useState<null | HTMLElement>(null);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const closeTimerRef = useRef<number | null>(null);
    const subMenuCloseTimerRef = useRef<number | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const clearSubMenuCloseTimer = () => {
        if (subMenuCloseTimerRef.current) {
            clearTimeout(subMenuCloseTimerRef.current);
            subMenuCloseTimerRef.current = null;
        }
    };

    const handleOpen = (event: React.MouseEvent<HTMLDivElement>, label: string) => {
        clearCloseTimer();
        setAnchorEl(event.currentTarget);
        setActiveMenu(label);
    };

    const handleClose = () => {
        clearCloseTimer();
        setAnchorEl(null);
        setActiveMenu(null);
        setSubMenuAnchor(null);
        setActiveSubMenu(null);
    };

    const handleCloseDelayed = () => {
        closeTimerRef.current = setTimeout(() => {
            handleClose();
        }, 200);
    };

    const handleMenuMouseEnter = () => {
        clearCloseTimer();
    };

    const handleSubMenuOpen = (event: React.MouseEvent<HTMLElement>, label: string) => {
        clearSubMenuCloseTimer();
        setSubMenuAnchor(event.currentTarget);
        setActiveSubMenu(label);
    };

    const handleSubMenuClose = () => {
        clearSubMenuCloseTimer();
        setSubMenuAnchor(null);
        setActiveSubMenu(null);
    };

    const handleSubMenuCloseDelayed = () => {
        subMenuCloseTimerRef.current = setTimeout(() => {
            handleSubMenuClose();
        }, 200);
    };

    const handleSubMenuMouseEnter = () => {
        clearSubMenuCloseTimer();
    };

    const handleItemClick = (path: string) => {
        clearCloseTimer();
        clearSubMenuCloseTimer();
        navigate(path);
        setAnchorEl(null);
        setActiveMenu(null);
        setSubMenuAnchor(null);
        setActiveSubMenu(null);
    };

    // Recursively check if any nested path is active
    const isPathActive = (item: any): boolean => {
        if (item.path === location.pathname) return true;
        if (item.subMenu) {
            return item.subMenu.some((sub: any) => isPathActive(sub));
        }
        if (item.subChildren) {
            return item.subChildren.some((child: any) => isPathActive(child));
        }
        return false;
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "start",
                gap: 2,
                p: 1,
                bgcolor: "background.paper",
            }}
        >
            {items.map((item) => {
                const isParentActive = isPathActive(item);
                const hasSubMenu = item.subMenu && item.subMenu.length > 0;
                const isMenuOpen = activeMenu === item.label;

                return (
                    <React.Fragment key={item.label}>
                        <Box
                            onMouseEnter={hasSubMenu ? (e) => handleOpen(e, item.label) : undefined}
                            onMouseLeave={hasSubMenu ? handleCloseDelayed : undefined}
                            onClick={
                                hasSubMenu
                                    ? (e) => handleOpen(e, item.label)
                                    : () => handleItemClick(item.path || "/")
                            }
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                cursor: "pointer",
                                px: 1.5,
                                py: 0.5,
                                fontFamily: "Roboto Flex, sans-serif",
                                fontWeight: 500,
                                fontSize: "15px",
                                lineHeight: "25.5px",
                                color: isParentActive ? "#0099DC" : "#333333",
                                "&:hover": {
                                    color: "#0099DC",
                                },
                            }}
                        >
                            {item.icon && <Box sx={{ display: "flex", alignItems: "center" }}>{item.icon}</Box>}
                            <Typography
                                sx={{
                                    fontFamily: "Roboto Flex, sans-serif",
                                    fontWeight: 500,
                                    fontSize: "15px",
                                    lineHeight: "25.5px",
                                }}
                            >
                                {item.label}
                            </Typography>
                            {hasSubMenu && <FaChevronDown size={12} />}
                        </Box>

                        {hasSubMenu && (
                            <Menu
                                anchorEl={anchorEl}
                                open={isMenuOpen}
                                onClose={() => { }}
                                MenuListProps={{
                                    onMouseLeave: handleCloseDelayed,
                                    onMouseEnter: handleMenuMouseEnter,
                                }}
                                sx={{
                                    pointerEvents: "none",
                                    "& .MuiPaper-root": {
                                        pointerEvents: "auto",
                                    },
                                }}
                            >
                                {item.subMenu?.map((sub) => {
                                    const isSubActive = isPathActive(sub);
                                    const hasSubChildren = sub.subChildren && sub.subChildren.length > 0;
                                    const isSubMenuOpen = activeSubMenu === sub.label;

                                    return (
                                        <React.Fragment key={sub.label}>
                                            <MUIMenuItem
                                                selected={isSubActive}
                                                onClick={
                                                    hasSubChildren
                                                        ? undefined
                                                        : () => handleItemClick(sub.path || "/")
                                                }
                                                onMouseEnter={
                                                    hasSubChildren
                                                        ? (e) => handleSubMenuOpen(e, sub.label)
                                                        : () => {
                                                            clearSubMenuCloseTimer();
                                                            setSubMenuAnchor(null);
                                                            setActiveSubMenu(null);
                                                        }
                                                }
                                                sx={{
                                                    fontWeight: 400,
                                                    color: "#333333 !important",
                                                    bgcolor: isSubActive ? "#E6F5F9 !important" : "transparent !important",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    "&.Mui-selected": {
                                                        bgcolor: "#E6F5F9 !important",
                                                        color: "#0099DC",
                                                    },
                                                    "&.Mui-selected:hover": {
                                                        bgcolor: "transparent !important",
                                                        color: "#0099DC",
                                                    },
                                                    "&:hover": {
                                                        bgcolor: "transparent",
                                                        color: "#0099DC",
                                                    },
                                                }}
                                            >
                                                {sub.label}
                                                {hasSubChildren && (
                                                    <FaChevronRight
                                                        size={12}
                                                        style={{ marginLeft: "16px" }}
                                                    />
                                                )}
                                            </MUIMenuItem>

                                            {hasSubChildren && (
                                                <Menu
                                                    anchorEl={subMenuAnchor}
                                                    open={isSubMenuOpen}
                                                    onClose={() => { }}
                                                    anchorOrigin={{
                                                        vertical: "top",
                                                        horizontal: "right",
                                                    }}
                                                    transformOrigin={{
                                                        vertical: "top",
                                                        horizontal: "left",
                                                    }}
                                                    MenuListProps={{
                                                        onMouseLeave: handleSubMenuCloseDelayed,
                                                        onMouseEnter: handleSubMenuMouseEnter,
                                                    }}
                                                    sx={{
                                                        pointerEvents: "none",
                                                        "& .MuiPaper-root": {
                                                            pointerEvents: "auto",
                                                        },
                                                    }}
                                                >
                                                    {sub.subChildren?.map((child) => {
                                                        const isChildActive = location.pathname === child.path;
                                                        return (
                                                            <MUIMenuItem
                                                                key={child.label}
                                                                selected={isChildActive}
                                                                onClick={() => handleItemClick(child.path || "/")}
                                                                sx={{
                                                                    fontWeight: 400,
                                                                    color: "#333333 !important",
                                                                    bgcolor: isSubActive ? "#E6F5F9 !important" : "transparent !important",
                                                                    "&.Mui-selected": {
                                                                        bgcolor: "transparent !important",
                                                                        color: "#E6F5F9",
                                                                    },
                                                                    "&.Mui-selected:hover": {
                                                                        bgcolor: "transparent !important",
                                                                        color: "#0099DC",
                                                                    },
                                                                    "&:hover": {
                                                                        bgcolor: "transparent",
                                                                        color: "#0099DC",
                                                                    },
                                                                }}
                                                            >
                                                                {child.label}
                                                            </MUIMenuItem>
                                                        );
                                                    })}
                                                </Menu>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </Menu>
                        )}
                    </React.Fragment>
                );
            })}
        </Box>
    );
};

export default MenuBar;

