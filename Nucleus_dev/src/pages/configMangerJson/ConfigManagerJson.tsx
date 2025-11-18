// File: src/components/ConfigManagerJson/ConfigManagerJson.tsx
import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Box, Typography, Grid } from "@mui/material";
import type { RootState } from "../../slices";

import LeftColumn from "./FileUploader";
import MiddleColumn from "./OrderContent";
import RightColumn from "./ItemAttribute";

// const ConfigManagerJson: React.FC = () => {
//   const [col1Collapsed, setCol1Collapsed] = useState<boolean>(false);
//   const file = useSelector((state: RootState) => state.file.file);

//   return (
//     <Box sx={{ p: 2 }}>

//       <Typography
//         variant="h6"
//         sx={{
//           fontWeight: 600,
//           bgcolor: "white",
//           p: 2,
//           mb: 2,
//           borderRadius: 1,
//           boxShadow: 1,
//         }}
//       >
//         Service Order Creation and Configuration
//       </Typography>

//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "row",
//           flexWrap: "nowrap",
//           gap: 2,
//           transition: "all 0.3s ease",
//           overflow: "hidden",
//         }}
//       >

//         <Box
//           sx={{
//             flexShrink: 0,
//             width: col1Collapsed ? "0px" : "33%",
//             transition: "all 0.3s ease",
//             overflow: "hidden",
//           }}
//         >
//           <LeftColumn
//             col1Collapsed={col1Collapsed}
//             setCol1Collapsed={setCol1Collapsed}
//           />
//         </Box>


//         <Box
//           sx={{
//             flexShrink: 0,
//             flexGrow: 1,
//             width: col1Collapsed ? "50%" : "40%",
//             transition: "all 0.3s ease",
//           }}
//         >
//           <MiddleColumn />
//         </Box>

//         <Box
//           sx={{
//             flexShrink: 0,
//             flexGrow: 1,
//             width: col1Collapsed ? "50%" : "27%",
//             transition: "all 0.3s ease",
//           }}
//         >
//           <RightColumn />
//         </Box>
//       </Box>



//       <Toaster position="top-right" reverseOrder={false} />

//       <style>{`
//         .loader {
//           border-radius: 50%;
//           border: 4px solid #f3f3f3;
//           border-top: 4px solid #0099DC;
//           width: 40px;
//           height: 40px;
//           animation: spin 1s linear infinite;
//         }
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>
//     </Box>
//   );
// };
const ConfigManagerJson: React.FC = () => {
  const [col1Collapsed, setCol1Collapsed] = useState(false);
  const file = useSelector((state: RootState) => state.file.file);

  return (
    <Box>
      <Typography
        // variant="h6"
        sx={{
          fontWeight: 600,
          fontSize: '18px',
          mb: 2,
          fontFamily: 'Roboto'
        }}
      >
        Service Order Creation
      </Typography>

      <Grid container spacing={2} alignItems="stretch">
        {!col1Collapsed && (
          <Grid size={{ xs: 12, md: 3.5 }}>
            <LeftColumn
              col1Collapsed={col1Collapsed}
              setCol1Collapsed={setCol1Collapsed}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12, md: col1Collapsed ? 7 : 5 }}>
          <MiddleColumn />
        </Grid>

        <Grid size={{ xs: 12, md: col1Collapsed ? 5 : 3.5 }}>
          <RightColumn />
        </Grid>
      </Grid>

      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default ConfigManagerJson;
