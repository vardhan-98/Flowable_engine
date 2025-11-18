import React from "react";
import { Box, Container } from "@mui/material";
// import Header from "./Header";
// import MenuBar from "./MenuBar";
// import { menuItems } from "./menuConfig";
import { Outlet } from "react-router-dom";
import Header from "../header/Header";
import MenuBar from "../sidebar/Sidebar";
import { menuItems } from "../../components/Data/menuItems";
import Footer from "../footer/Footer";
import { grey } from "@mui/material/colors";
// import Footer from "../../footer/Footer";

export default function LayoutDesign() {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflow: "hidden", // prevent body scroll
            }}
        >
            {/* Fixed Header */}
            <Box sx={{ flexShrink: 0, zIndex: 10, position: "sticky", top: 0 }}>
                <Header />
            </Box>
 
            {/* Fixed MenuBar */}
            <Box
                sx={{
                    flexShrink: 0,
                    position: "sticky",
                    top: 64, 
                    zIndex: 9,
                    bgcolor: "white",
                    borderBottom: "1px solid #E0E0E0",
                }}
            >
                <MenuBar items={menuItems}/>
            </Box>
 
            {/* Scrollable Content */}
            <Container
                maxWidth={false}
                disableGutters
                sx={{
                    flex: 1,
                    width: "100%",
                    backgroundColor: "#F5F8FA",
                    overflowY: "auto", 
                    "&::-webkit-scrollbar": {
                        width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#C1C1C1",
                        borderRadius: "4px",
                    },
                    "&.MuiContainer-root": {
                        maxWidth: "100% !important",
                        margin: "0 !important",
                        padding: "0 !important",
                    },
                }}
            >
                <Box
                    sx={{
                        m: "20px",
                        borderRadius: "8px",
                        backgroundColor: "#F5F8FA",
                    }}
                >
                    <Outlet/>
                </Box>
            </Container>
 
            {/* Fixed Footer */}
            <Box sx={{ flexShrink: 0, position: "sticky", bottom: 0, zIndex: 10 }}>
                <Footer />
            </Box>
        </Box>
    );
}

