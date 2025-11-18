import {
    AiOutlineHome,
    AiOutlineUsergroupAdd,
} from "react-icons/ai";
import DeviceIcon from "../../assets/fluent_device-eq-16-regular.svg?react";
import {
    MdDevices,            
    MdOutlinePersonAddAlt,
    MdUpgrade,            
    MdOutlineMonitorHeart,
} from "react-icons/md";
import { BsSoundwave } from "react-icons/bs";
import type { MenuItem } from "../../types/Menu";

export const menuItems: MenuItem[] = [
 
    { label: "Home", path: "/dashboard", icon: <AiOutlineHome size={18} /> },
    { label: "Devices", path: "/devices", icon: <BsSoundwave size={18} /> },
    {
        label: "Upgrade",
        icon: <MdUpgrade size={18}/>,
        subMenu: [
            { label: "Calander View", path: "/calendar" },
            { label: "Upgrade Dashboard", path: "/upgradedashboard" },
            { label: "Upgrade Summeary", path: "/UpgradeScheduleSummary" },
            { label: "BPMN", path: "/bpmn" },
            { label: "Work Flow", path: "/workflows" },
            // { label: "Roster Details", path: "" }
        ]
    },
    {
        label: "New Activation",
        icon: <MdOutlinePersonAddAlt size={18} />,
        subMenu: [
            { label: "Service order creation", path: "/newinstall" },
            { label: "Upload SDS", path: "/activation/prepaid" },
        ]
    },
    {
        label: "Monitoring",
        icon: <MdOutlineMonitorHeart size={18} />,
        subMenu: [
            {
                label: "Settings",
                subChildren: [
                    { label: "Email", path: "/" },
                    { label: "Servicenow", path: "/" },
                    { label: "Action Management", path: "/" },
                    { label: "Maintance Scheduler", path: "/" }
                ]
            },
            { label: "Fault Dashboard", path: "/" },
            { label: "Performance Dashboard", path: "/" },
            { label: "Reports", path: "/" }
        ]
    },
    {
        label: "User Management",
        icon: <AiOutlineUsergroupAdd size={18} />,
        subMenu: [
            { label: "Roles", path: "/roles" },
            { label: "SecurityProfileVeiw", path: "/security-veiw" },
        ],
    }
]