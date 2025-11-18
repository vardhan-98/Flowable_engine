import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../layout/login/Login";
import ServiceSelection from "../layout/serviceSelection/ServiceSelection";
import LayoutDesign from "../layout/mainLayout/LayoutDesign";
import ConfigManagerJson from "../pages/configMangerJson/ConfigManagerJson";
//import NewInstall from "../pages/newinstall/NewInstall";
import OrderCreationProgress from "../pages/orderCreationProgress/OrderCreationProgress";
import Devices from "../pages/devices/Devices";
// import ActivationWorkflow from "../pages/newinstall/Newinstall";
import CalendarWithTabs from "../pages/CalendarWithTabs/CalendarWithTabs";
import UpgradeScheduleSummary from "../pages/CalendarWithTabs/upgradeScheduleSummary";
import BpmnView from "../pages/bpmnModule/bpmnView";
import Workflows from "../pages/CalendarWithTabs/Workflows";
import UpgradeDashboard from "../pages/CalendarWithTabs/upgradeDashboard";
import ActivationWorkflow from "../pages/newinstall/NewInstall";
// import RoasterDetails from "../pages/roasterDetails/roasterDetails";
//import RoasterDetails from "../pages/roasterDetails/roasterDetails";

// import LayoutDesign from "../Components/ServiceDelivery/LayoutDesign.tsx";
// import Dashboard from "../Components/ServiceDelivery/Dashboard.tsx";
// import ConfigManagerJson from "../Components/ServiceDelivery/ConfigManagerJson.tsx";
// import Login from "../Components/Login.tsx";
// import ServiceSelection from "../Components/ServiceSelection.tsx";
// import OrderCreationProgress from "../Components/ServiceDelivery/OrderCreationProgress.tsx";


const Routing = () => {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />
        {/* Service selection */}
        <Route path="/services" element={<ServiceSelection />} />

        {/* Layout routes */}
        <Route element={<LayoutDesign />}>
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/config" element={<ConfigManagerJson />} />
          <Route path="/order-progress" element={<OrderCreationProgress />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/NewInstall" element={<ActivationWorkflow />} />
           <Route path="/calendar" element={<CalendarWithTabs />} />
            <Route path="/upgradedashboard" element={<UpgradeDashboard />} />
             <Route path="/UpgradeScheduleSummary" element={<UpgradeScheduleSummary />} />
              <Route path="/bpmn" element={<BpmnView />} />
               <Route path="/workflows" element={<Workflows />} />
                {/* <Route path="/workflows" element={<RoasterDetails/>} /> */}
                
      
    {/* <Route path="/NewInstall" element={<NewInstall/>}/> */}
        </Route>

        {/* Root path → always go to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Any invalid path → go to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default Routing;






// Normal routing

// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LayoutDesign from '../Components/ServiceDelivery/LayoutDesign.tsx';
// import Dashboard from '../Components/ServiceDelivery/Dashboard.tsx';
// import ConfigManagerJson from '../Components/ServiceDelivery/ConfigManagerJson.tsx';

// const Routing = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LayoutDesign />}>
         
//           <Route index element={<Navigate to="dashboard" replace />} />

          
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="config" element={<ConfigManagerJson />} />

       
//           <Route path="*" element={<Navigate to="dashboard" replace />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// };

// export default Routing;


