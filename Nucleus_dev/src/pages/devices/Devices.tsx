// src/pages/DevicesPage.tsx (unchanged)
import React, { useState } from 'react';
// import { Container, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import UploadDevicesModal from '../../components/devices/UploadDevicesModal';
import AddDeviceModal from '../../components/devices/AddDeviceModal';
import DevicesTable from '../../components/devices/DevicesTable';



const Devices: React.FC = () => {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    // const handleUploadOpen = () => setUploadOpen(true);
    // const handleUploadClose = () => setUploadOpen(false);
    // const handleAddOpen = () => setAddOpen(true);
    // const handleAddClose = () => setAddOpen(false);


    return (
        <div>
            <DevicesTable
                onUploadClick={() => setUploadOpen(true)}
                onAddClick={() => setAddOpen(true)}
            />
            {/* Modals */}
            <UploadDevicesModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
            <AddDeviceModal open={addOpen} onClose={() => setAddOpen(false)} />
        </div>
    )

}

export default Devices

