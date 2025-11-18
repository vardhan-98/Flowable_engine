// src/pages/login/Login.tsx
import React, { useState, useEffect } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from "formik";
import * as Yup from 'yup';
// import { loginUser, resetLoginFlag} from '../../slices/auth/login/thunk';
import { createSelector } from 'reselect';
// import withRouter from '../../components/common/withRouter';
// import logo from "../../assets/svg/NucleusNewLogo.svg";
import NucleusLogo from "../../assets/svg/Nucleus_New_Logo.svg?react";
// import { apiError } from "../../slices/auth/login/reducer";
 
const Login = (props: any) => {
    const dispatch: any = useDispatch();
    const navigate = useNavigate();
    // Redux state selector
    const selectLayoutState = (state: any) => state;
    const loginpageData = createSelector(
        selectLayoutState,
        (state) => ({
            user: state.Account?.user || null,
            error: state.Login?.error || "",
            errorMsg: state.Login?.errorMsg || false,
        })
    );
 
    const { user, error, errorMsg } = useSelector(loginpageData);
 
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(false);
 
    // Update form values when user data changes
    useEffect(() => {
        if (user && user.user) {
            const updatedUserData = user.user?.email || '';
            const updatedUserPassword = user.user?.confirm_password || '';
            validation.setValues({
                username: updatedUserData,
                password: updatedUserPassword,
            });
        }
    }, [user]);
 
    // Password validation schema
    const PasswordSchema = Yup.string()
        .required("Please enter your password")
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password cannot exceed 64 characters")
        .matches(
            /^(?=\S+$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            "Password must contain upper and lower case letters, a number, a special character and have no spaces"
        );
 
    // Formik validation
    const validation: any = useFormik({
        enableReinitialize: true,
        initialValues: {
            username: '',
            password: '',
        },
        validationSchema: Yup.object({
            username: Yup.string().required("Please enter your username"),
            password: PasswordSchema
        }),
        validateOnChange: true,
        onSubmit: (values) => {
            navigate('/NewInstall');
            // setLoader(true);     
        },
    });
 
    // Handle error messages
    // useEffect(() => {
    //     if (errorMsg) {
    //         setTimeout(() => {
    //             dispatch(resetLoginFlag());
    //             setLoader(false);
    //         }, 3000);
    //     }
    //     setLoader(false);
   
   
    // }, [dispatch, errorMsg]);
 
    return (
        <React.Fragment>
            <div className="flex items-center justify-center min-h-screen bg-[#F0F7FF]">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 border-t-4 border-[#0099DC]">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-6">
                        <span className="flex flex-row items-center">
                            {/* <img
                                src={logo}
                                alt="Nucleus Logo"
                                className="h-5 mb-2"
                            /> */}
                            <NucleusLogo/>
                            {/* <p className="text-[#0099DC] text-xl relative top-4 ml-2 font-semibold">Nucleus</p> */}
                        </span>
                       
                    </div>
 
                    {/* Title */}
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 text-left">
                        Log in to your Account
                    </h2>
 
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}
 
                    {/* Login Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            validation.handleSubmit();
                            return false;
                        }}
                        className="space-y-4"
                    >
                        {/* Username Input */}
                        <div>
                            <input
                                name="username"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.username || ""}
                                type="text"
                                placeholder="Enter Login ID"
                                className={`w-full px-4 py-2 border ${
                                    validation.touched.username && validation.errors.username
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                } rounded-md focus:ring-2 focus:ring-blue-400 outline-none`}
                            />
                            {validation.touched.username && validation.errors.username && (
                                <p className="text-red-600 text-sm mt-1 font-medium">
                                    {validation.errors.username}
                                </p>
                            )}
                        </div>
 
                        {/* Password Input */}
                        <div className="relative">
                            <input
                                name="password"
                                value={validation.values?.password || ""}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your Password"
                                className={`w-full px-4 py-2 border ${
                                    validation.touched.password && validation.errors.password
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                } rounded-md focus:ring-2 focus:ring-blue-400 outline-none pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {/* {showPassword ? <GoEyeClosed size={18} /> : <GoEye size={18} />} */}
                            </button>
                            {validation.touched.password && validation.errors.password && (
                                <p className="text-red-600 text-sm mt-1 font-medium">
                                    {validation.errors.password}
                                </p>
                            )}
                        </div>
 
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loader}
                            className={`w-full py-2 bg-[#0099DC] text-white rounded-md shadow hover:opacity-90 transition flex items-center justify-center ${
                                loader ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                            {loader ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Loading...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
 
                        {/* Forgot Password Link
                        <div className="text-center mt-4">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div> */}
                    </form>
                </div>
            </div>
        </React.Fragment>
    );
};
 
export default Login;