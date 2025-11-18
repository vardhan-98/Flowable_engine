// src/components/ServiceOrderForm.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import NucleusLogo from "../../assets/svg/Nucleus_New_Logo.svg?react";
import {
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Grid,
    Button,
    Box,
    Typography,
    CircularProgress,
    Checkbox,
    Backdrop,
    FormControlLabel,
    DialogContent,
    DialogActions,
    Dialog,
    DialogTitle
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import debounce from "lodash/debounce";
import { createCustomerDataThunk, fetchContactsThunk, fetchSitesThunk, searchCustomersThunk } from "../../slices/newInstall/thunk";
import { setActiveStep, setSelectedCustomerName, setStepCompleted } from "../../slices/newInstall/reducer";
import type { RootState } from "../../slices";
// import toast from "react-hot-toast";

interface FormValues {
    customerName: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;

    // site fields
    siteName?: string;
    gpsSiteId?: string;
    ucpeHostName?: string;
    jumpServerHostName?: string
    serviceLine?: string
    siteCountry?: string;
    siteState?: string;
    siteCity?: string;
    siteAddress?: string;
    siteZip?: string;

    // local contact fields
    localContactName?: string;
    localContactPhone?: string;
    localContactEmail?: string;

    // internal toggles
    addNewContact?: boolean;
    addNewSite?: boolean;

    // other service request fields (e.g. IP)
    ipV4?: string;
    ipV6?: string;
}

//validations
const validationSchema = Yup.object({
    customerName: Yup.string().required("Customer name is required"),

    // Contact validations
    contactName: Yup.string().required("Contact name is required"),
    contactEmail: Yup.string().required("Contact email is required").email("Invalid email"),
    contactPhone: Yup.string().required("Contact phone is required"),

    // Site validations
    gpsSiteId: Yup.string().required("GPS Site ID is required"),
    siteName: Yup.string().required("Site name is required"),
    ucpeHostName: Yup.string().required("UCPE Host Name is required"),
    jumpServerHostName: Yup.string().required("Jump Server Host Name is required"),
    serviceLine: Yup.string().required("Service Line is required"),
    siteCountry: Yup.string().required("Country is required"),
    siteState: Yup.string().required("State is required"),
    siteCity: Yup.string().required("City is required"),
    siteAddress: Yup.string().required("Address is required"),
    siteZip: Yup.string().required("Postal/Zip is required"),

    // Local contact validations
    localContactName: Yup.string().required("Local contact name is required"),
    localContactPhone: Yup.string().required("Local contact phone is required"),
    localContactEmail: Yup.string().required("Local contact email is required").email("Invalid email"),

    // IP Address - optional
    ipV4: Yup.string().notRequired(),
    ipV6: Yup.string().notRequired(),
});


const ServiceOrderStep: React.FC = () => {

    const dispatch = useDispatch();
    const {
        searchResults,
        loadingSearch,
        contacts,
        sites,
        loadingContacts,
        loadingSites,
        selectedCustomerName,
    } = useSelector((s: RootState) => s.activation);

    // local state for showing dropdown suggestions
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    // State for checkboxes
    const [useAsNewCustomer, setUseAsNewCustomer] = useState(false);
    const [addNewContact, setAddNewContact] = useState(false);
    const [addNewSite, setAddNewSite] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");

    // Toast state
    // const [toast, setToast] = useState({
    //     open: false,
    //     message: "",
    //     severity: "success" as "success" | "error" | "info" | "warning"
    // });

    // Loading state for form submission

    //Model
    // const [responseModalOpen, setResponseModalOpen] = useState(false);
    // const [apiResponse, setApiResponse] = useState<any>(null);


    // debounced search
    const debouncedSearch = useMemo(
        () =>
            debounce((q: string) => {
                if (q && q.length >= 1) dispatch(searchCustomersThunk(q) as any);
            }, 300),
        [dispatch]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const initialValues: FormValues = {
        customerName: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        siteName: "",
        gpsSiteId: "",
        ucpeHostName: "",
        jumpServerHostName: "",
        serviceLine: "",
        siteCountry: "",
        siteState: "",
        siteCity: "",
        siteAddress: "",
        siteZip: "",
        localContactName: "",
        localContactPhone: "",
        localContactEmail: "",
        addNewContact: false,
        addNewSite: false,
        ipV4: "",
        ipV6: "",
    };


    //FORM SUBMIT LPGIC

    const handleSubmit = async (
        values: typeof initialValues,
        { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }
    ) => {
        setIsUploading(true);
        try {
            // ✅ Always send full payload
            const payload = {
                customer_name: selectedCustomerName || values.customerName,

                site: {
                    gps_site_id: values.gpsSiteId,
                    ucpe_host_name: values.ucpeHostName,
                    site_name: values.siteName,
                    service_location_country: values.siteCountry,
                    service_location_state: values.siteState,
                    service_location_city: values.siteCity,
                    service_location_address: values.siteAddress,
                    service_location_zip: values.siteZip,
                    lcon_phone: values.localContactPhone,
                    lcon_name: values.localContactName,
                    lcon_email: values.localContactEmail,
                    service_line: values.serviceLine,
                    jump_server_host_name: values.jumpServerHostName
                },

                contact: {
                    customer_contact_name: values.contactName,
                    customer_contact_phone: values.contactPhone,
                    customer_contact_email: values.contactEmail
                },
            };

            //Single API call → Always send payload
            const res = await dispatch(createCustomerDataThunk(payload) as any);
            //Store backend response and open modal
            // setApiResponse(res);
            // setResponseModalOpen(true);
            //check box unchecked
            if (res.type.endsWith('/fulfilled')) {
                // setToast({
                //     open: true,
                //     message: "Service order created successfully!",
                //     severity: "success"
                // });
             
                setUseAsNewCustomer(false);
                setAddNewContact(false);
                setAddNewSite(false);
                // ✅ reset flow
                resetForm();
                setSnackbarMessage("Form submitted successfully!");
                setOpenSnackbar(true);
                dispatch(setSelectedCustomerName(null) as any);
                // ✅ Mark this step completed
                dispatch(setStepCompleted(0));
                // ✅ Go to next step
                dispatch(setActiveStep(2));
            } else {
                throw new Error(res.payload || "Failed to create service order");
            }
        } catch (err: any) {
            console.error(err);
            setSnackbarMessage(err.message || "Something went wrong!");
            setOpenSnackbar(true);
            // toast.error(err.message || "Failed to create service order")
            // setToast({
            //     open: true,
            //     message: err.message || "Failed to create service order",
            //     severity: "error"
            // });
        } finally {
            setIsUploading(false);
            setSubmitting(false);
        }
    };



    return (

        <Box
            display="flex"
            flexDirection="column"
            height="calc(100vh - 150px)" // fit within page area
        >
            {/* Centered Loading Backdrop */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity={snackbarMessage.includes("successfully") ? "success" : "error"}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
                open={isUploading}
            >
                <NucleusLogo />
            </Backdrop>
            {/* <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar> */}


            {/* ---------- Header (Fixed) ---------- */}
            <Box display="flex"
                sx={{
                    borderBottom: "2px solid #E0E0E0",
                }}
            >
                <Typography variant="h6" fontWeight={500} pt={1} pb={1} pr={3} pl={3}>
                    Service Order Creation
                </Typography>
            </Box>

            <Box p={2}
                sx={{
                    maxHeight: "calc(100vh - 150px)",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    pr: 3,
                    pl: 3,
                    "&::-webkit-scrollbar": { width: 8 },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#ccc",
                        borderRadius: 4,
                    },
                }}
            >
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    validateOnChange={true}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
                        <Form>
                            <Box>
                                {/* <Grid container spacing={2} alignItems="center"> */}
                                {/* Use as new customer checkbox */}
                                <Box mb={2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={useAsNewCustomer}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setUseAsNewCustomer(checked);

                                                    if (checked) {
                                                        // Clear search and selected customer
                                                        setSuggestionsOpen(false);
                                                        dispatch(setSelectedCustomerName(null) as any);

                                                        // Auto-check addNewContact and addNewSite
                                                        setAddNewContact(true);
                                                        setAddNewSite(true);

                                                        // Clear all fields
                                                        setFieldValue("customerName", "");
                                                        setFieldValue("contactName", "");
                                                        setFieldValue("contactEmail", "");
                                                        setFieldValue("contactPhone", "");
                                                        setFieldValue("siteName", "");
                                                        setFieldValue("gpsSiteId", "");
                                                        setFieldValue("ucpeHostName", "");
                                                        setFieldValue("jumpServerHostName", "");
                                                        setFieldValue("serviceLine", "");
                                                        setFieldValue("siteCountry", "");
                                                        setFieldValue("siteState", "");
                                                        setFieldValue("siteCity", "");
                                                        setFieldValue("siteAddress", "");
                                                        setFieldValue("siteZip", "");
                                                        setFieldValue("localContactName", "");
                                                        setFieldValue("localContactPhone", "");
                                                        setFieldValue("localContactEmail", "");
                                                    } else {
                                                        // Uncheck addNewContact and addNewSite
                                                        setAddNewContact(false);
                                                        setAddNewSite(false);
                                                    }
                                                }}
                                            />
                                        }
                                        label="Add new customer"
                                    />

                                    {/* Add new contact checkbox */}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={addNewContact}
                                                disabled={useAsNewCustomer} // Disabled when "Use as new customer" is checked
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setAddNewContact(checked);

                                                    if (checked) {
                                                        // Auto-check addNewSite
                                                        setAddNewSite(true);
                                                        // Clear contact fields when adding new contact
                                                        setFieldValue("contactName", "");
                                                        setFieldValue("contactEmail", "");
                                                        setFieldValue("contactPhone", "");

                                                        setFieldValue("siteName", "");
                                                        setFieldValue("gpsSiteId", "");
                                                        setFieldValue("ucpeHostName", "");
                                                        setFieldValue("jumpServerHostName", "");
                                                        setFieldValue("serviceLine", "");
                                                        setFieldValue("siteCountry", "");
                                                        setFieldValue("siteState", "");
                                                        setFieldValue("siteCity", "");
                                                        setFieldValue("siteAddress", "");
                                                        setFieldValue("siteZip", "");
                                                        setFieldValue("localContactName", "");
                                                        setFieldValue("localContactPhone", "");
                                                        setFieldValue("localContactEmail", "");
                                                    } else {
                                                        // Uncheck addNewSite
                                                        setAddNewSite(false);
                                                    }
                                                }}
                                            />
                                        }
                                        label="Add new contact"
                                    />

                                    {/* Add new site checkbox */}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={addNewSite}
                                                disabled={useAsNewCustomer || addNewContact}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setAddNewSite(checked);

                                                    if (checked) {
                                                        // Clear site fields when adding new site
                                                        setFieldValue("siteName", "");
                                                        setFieldValue("gpsSiteId", "");
                                                        setFieldValue("ucpeHostName", "");
                                                        setFieldValue("jumpServerHostName", "");
                                                        setFieldValue("serviceLine", "");
                                                        setFieldValue("siteCountry", "");
                                                        setFieldValue("siteState", "");
                                                        setFieldValue("siteCity", "");
                                                        setFieldValue("siteAddress", "");
                                                        setFieldValue("siteZip", "");
                                                        setFieldValue("localContactName", "");
                                                        setFieldValue("localContactPhone", "");
                                                        setFieldValue("localContactEmail", "");
                                                    }
                                                }}
                                            />
                                        }
                                        label="Add new site"
                                    />
                                </Box>
                                {/* Customer Section */}
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                        Customer
                                    </Typography>

                                    {/* <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={Boolean(values.addNewContact)}
                                                onChange={(e) => setFieldValue("addNewContact", e.target.checked)}
                                            />
                                        }
                                        label="Add new contact"
                                    /> */}
                                    <Grid container spacing={2}>
                                        {/* Customer name & search */}
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={1}>
                                                Name<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField
                                                placeholder="name"
                                                fullWidth
                                                name="customerName"
                                                value={values.customerName}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    handleChange(e);

                                                    // Only trigger search if NOT using as new customer
                                                    if (!useAsNewCustomer) {
                                                        setSuggestionsOpen(true);
                                                        debouncedSearch(v);
                                                        // if user types, clear previously selected customer
                                                        dispatch(setSelectedCustomerName(null) as any);
                                                    }
                                                }}
                                                helperText={errors.customerName && touched.customerName ? errors.customerName : ""}
                                                error={Boolean(errors.customerName && touched.customerName)}
                                                InputProps={{
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />

                                            {/* suggestions dropdown - only show when NOT using as new customer */}
                                            {!useAsNewCustomer && suggestionsOpen && (loadingSearch ? <CircularProgress size={20} /> : null)}
                                            {!useAsNewCustomer && suggestionsOpen && searchResults.length > 0 && (
                                                <Box sx={{ border: "1px solid #ddd", mt: 1, background: "#fff" }}>
                                                    {searchResults.map((name: string) => (
                                                        <Box
                                                            key={name}
                                                            p={1}
                                                            sx={{ cursor: "pointer", "&:hover": { background: "#f3f3f3" } }}
                                                            onClick={() => {
                                                                // select customer
                                                                setFieldValue("customerName", name);
                                                                setSuggestionsOpen(false);
                                                                dispatch(setSelectedCustomerName(name) as any);
                                                                // fetch contacts and sites
                                                                dispatch(fetchContactsThunk(name) as any);
                                                                dispatch(fetchSitesThunk(name) as any);
                                                            }}
                                                        >
                                                            {name}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Grid>


                                        {/* Contact (dropdown if contacts exist) */}
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={1}>
                                                Contact<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            {contacts && contacts.length > 0 && !addNewContact ? (
                                                <FormControl fullWidth>
                                                    <Select
                                                        displayEmpty
                                                        value={values.contactName || ""}
                                                        onChange={(e) => {
                                                            const sel = e.target.value as string;
                                                            setFieldValue("contactName", sel);

                                                            const found = contacts.find((c: any) => c.customer_contact_name === sel);
                                                            if (found) {
                                                                setFieldValue("contactEmail", found.customer_contact_email ?? "");
                                                                setFieldValue("contactPhone", found.customer_contact_phone ?? "");
                                                            }
                                                        }}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <span style={{ color: "#888" }}>Select contact</span>;
                                                            }
                                                            return selected;
                                                        }}
                                                    >
                                                        <MenuItem disabled value="">
                                                            <em>Select contact</em>
                                                        </MenuItem>
                                                        {contacts.map((c, i) => (
                                                            <MenuItem key={i} value={c.customer_contact_name}>
                                                                {c.customer_contact_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            ) : (
                                                <TextField
                                                    fullWidth
                                                    name="contactName"
                                                    value={values.contactName}
                                                    onChange={handleChange}
                                                    placeholder="Enter contact name"
                                                    error={Boolean(errors.contactName && touched.contactName)}
                                                    helperText={errors.contactName && touched.contactName ? errors.contactName : ""}
                                                    InputProps={{
                                                        sx: {
                                                            "& .MuiInputBase-input": {
                                                                padding: "12px 10px",
                                                            }
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Grid>


                                        {/* Contact email & phone */}
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={1}>
                                                Email<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="Contact Email" name="contactEmail" fullWidth value={values.contactEmail} onChange={handleChange}
                                                error={Boolean(errors.contactEmail && touched.contactEmail)}
                                                helperText={errors.contactEmail && touched.contactEmail ? errors.contactEmail : ""}
                                                InputProps={{
                                                    readOnly: !addNewContact && contacts && contacts.length > 0 && Boolean(values.contactName),
                                                    sx: {
                                                        // ✅ for normal input field
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px", // reduce input padding
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={1}>
                                                Phone Number<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="Contact Phone" name="contactPhone" fullWidth value={values.contactPhone} onChange={handleChange}
                                                error={Boolean(errors.contactPhone && touched.contactPhone)}
                                                helperText={errors.contactPhone && touched.contactPhone ? errors.contactPhone : ""}
                                                InputProps={{
                                                    readOnly: !addNewContact && contacts && contacts.length > 0 && Boolean(values.contactName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Site Section */}
                                <Box mb={4} mt={4}>
                                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                        Site
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                Site Name<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            {sites && sites.length > 0 && !addNewSite ? (
                                                <FormControl fullWidth>
                                                    <InputLabel>Site</InputLabel>
                                                    <Select
                                                        label="Site"
                                                        value={values.siteName || ""}
                                                        onChange={(e) => {
                                                            const sel = e.target.value as string;
                                                            setFieldValue("siteName", sel);
                                                            const found = sites.find((s) => s.site_name === sel || s.gps_site_id === sel);
                                                            if (found) {
                                                                setFieldValue("gpsSiteId", found.gps_site_id ?? "");
                                                                setFieldValue("ucpeHostName", found.ucpe_host_name ?? "");
                                                                setFieldValue("jumpServerHostName", found.jump_server_host_name ?? "");
                                                                setFieldValue("serviceLine", found.service_line ?? "");
                                                                setFieldValue("siteCountry", found.service_location_country ?? "");
                                                                setFieldValue("siteState", found.service_location_state ?? "");
                                                                setFieldValue("siteCity", found.service_location_city ?? "");
                                                                setFieldValue("siteAddress", found.service_location_address ?? "");
                                                                setFieldValue("siteZip", found.service_location_zip ?? "");
                                                                setFieldValue("localContactName", found.lcon_name ?? "");
                                                                setFieldValue("localContactPhone", found.lcon_phone ?? "");
                                                                setFieldValue("localContactEmail", found.lcon_email ?? "");
                                                            }
                                                        }}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <span style={{ color: "#888" }}>Select Site</span>;
                                                            }
                                                            return selected;
                                                        }}
                                                    >
                                                        <MenuItem disabled value="">
                                                            <em>Select Site</em>
                                                        </MenuItem>

                                                        {sites.map((s: any, index) => (
                                                            <MenuItem key={index} value={s.site_name || s.gps_site_id || index}>
                                                                {s.site_name ?? s.gps_site_id}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            ) : (
                                                <TextField placeholder="Site Name" name="siteName" fullWidth value={values.siteName} onChange={handleChange}
                                                    error={Boolean(errors.siteName && touched.siteName)}
                                                    helperText={errors.siteName && touched.siteName ? errors.siteName : ""}
                                                    InputProps={{
                                                        sx: {
                                                            "& .MuiInputBase-input": {
                                                                padding: "12px 10px",
                                                            }
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                GPS Site ID<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="GPS Site ID" name="gpsSiteId" fullWidth value={values.gpsSiteId} onChange={handleChange}
                                                error={Boolean(errors.gpsSiteId && touched.gpsSiteId)}
                                                helperText={errors.gpsSiteId && touched.gpsSiteId ? errors.gpsSiteId : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                UCPE Host Name<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="UCPE Host Name" name="ucpeHostName" fullWidth value={values.ucpeHostName} onChange={handleChange}
                                                error={Boolean(errors.ucpeHostName && touched.ucpeHostName)}
                                                helperText={errors.ucpeHostName && touched.ucpeHostName ? errors.ucpeHostName : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                Jump Server Host Name<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="Jump Server Host Name" name="jumpServerHostName" fullWidth value={values.jumpServerHostName} onChange={handleChange}
                                                error={Boolean(errors.jumpServerHostName && touched.jumpServerHostName)}
                                                helperText={errors.jumpServerHostName && touched.jumpServerHostName ? errors.jumpServerHostName : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                Service Line<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="service Line" name="serviceLine" fullWidth value={values.serviceLine} onChange={handleChange}
                                                error={Boolean(errors.serviceLine && touched.serviceLine)}
                                                helperText={errors.serviceLine && touched.serviceLine ? errors.serviceLine : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                Country<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="Country" name="siteCountry" fullWidth value={values.siteCountry} onChange={handleChange}
                                                error={Boolean(errors.siteCountry && touched.siteCountry)}
                                                helperText={errors.siteCountry && touched.siteCountry ? errors.siteCountry : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                State<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="State" name="siteState" fullWidth value={values.siteState} onChange={handleChange}
                                                error={Boolean(errors.siteState && touched.siteState)}
                                                helperText={errors.siteState && touched.siteState ? errors.siteState : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                City/Town<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="City" name="siteCity" fullWidth value={values.siteCity} onChange={handleChange}
                                                error={Boolean(errors.siteCity && touched.siteCity)}
                                                helperText={errors.siteCity && touched.siteCity ? errors.siteCity : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                Address<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="Address" name="siteAddress" fullWidth value={values.siteAddress} onChange={handleChange}
                                                error={Boolean(errors.siteAddress && touched.siteAddress)}
                                                helperText={errors.siteAddress && touched.siteAddress ? errors.siteAddress : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                Postal Zip Code<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="Postal/Zip" name="siteZip" fullWidth value={values.siteZip} onChange={handleChange}
                                                error={Boolean(errors.siteZip && touched.siteZip)}
                                                helperText={errors.siteZip && touched.siteZip ? errors.siteZip : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Local Contact Section */}
                                <Box mb={4}>
                                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                        Local Contact
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {/* Local Contact */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                Local Contact Name<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="Local Contact Name" name="localContactName" fullWidth value={values.localContactName} onChange={handleChange}
                                                error={Boolean(errors.localContactName && touched.localContactName)}
                                                helperText={errors.localContactName && touched.localContactName ? errors.localContactName : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                Local Contact Phone number<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="Local Contact Phone" name="localContactPhone" fullWidth value={values.localContactPhone} onChange={handleChange}
                                                error={Boolean(errors.localContactPhone && touched.localContactPhone)}
                                                helperText={errors.localContactPhone && touched.localContactPhone ? errors.localContactPhone : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                Local Contact Email<span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField placeholder="Local Contact Email" name="localContactEmail" fullWidth value={values.localContactEmail} onChange={handleChange}
                                                error={Boolean(errors.localContactEmail && touched.localContactEmail)}
                                                helperText={errors.localContactEmail && touched.localContactEmail ? errors.localContactEmail : ""}
                                                InputProps={{
                                                    readOnly: !addNewSite && sites && sites.length > 0 && Boolean(values.siteName),
                                                    sx: {
                                                        "& .MuiInputBase-input": {
                                                            padding: "12px 10px",
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                                {/* IP Address*/}
                                {/* <Box mb={4}>
                                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                        IP Address
                                    </Typography>
                                    <Grid container spacing={2}>

                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                IP V4
                                            </Typography>
                                            <TextField placeholder="IP V4" name="ipV4" fullWidth value={values.ipV4} onChange={handleChange} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 1.5 }}>
                                            <Button variant="outlined" fullWidth sx={{ mt: 3 }}>
                                                Generate
                                            </Button>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="subtitle1" fontWeight={500} mb={2}>
                                                IP V6
                                            </Typography>
                                            <TextField placeholder="IP V6" name="ipV6" fullWidth value={values.ipV6} onChange={handleChange} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 1.5 }}>
                                            <Button variant="outlined" fullWidth sx={{ mt: 3 }}>
                                                Generate
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box> */}

                                <Grid>
                                    <Box flexShrink={0}
                                        pt={2}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="flex-end"
                                        bgcolor="white">
                                        <Button
                                            variant="contained"
                                            type="submit"
                                            sx={{ mt: 1, bgcolor: "#0099DC" }}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "...loading" : "Submit"}
                                        </Button>
                                    </Box>
                                </Grid>

                                {/* </Grid> */}
                            </Box>
                        </Form>
                    )}
                </Formik>
                {/* <Dialog open={responseModalOpen} onClose={() => setResponseModalOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Customer Created Successfully</DialogTitle>

                    <DialogContent dividers>
                        {apiResponse && (
                            <>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {apiResponse.message}
                                </Typography>

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2">Customer ID:</Typography>
                                    <Typography variant="body2">{apiResponse.customer_id}</Typography>

                                    <Typography variant="subtitle2" sx={{ mt: 1 }}>Message</Typography>
                                    <Typography variant="body2">{apiResponse.message}</Typography>
                                </Box>
                            </>
                        )}
                    </DialogContent>

                    <DialogActions>
                        <Button variant="contained" onClick={() => setResponseModalOpen(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog> */}

            </Box>

            {/* ---------- Footer (Fixed) ---------- */}
            {/* <Box
                flexShrink={0}
                pt={2}
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                bgcolor="white"
            >
                <Button variant="contained" color="primary">
                    Submit
                </Button>
            </Box> */}
        </Box>

    );
};

export default ServiceOrderStep;

