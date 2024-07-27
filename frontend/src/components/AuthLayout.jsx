import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LoginPopup, Spinner } from "../components";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../store/Slices/authSlice";

function AuthLayout({ children, authentication }) {
    const navigate = useNavigate();
    const authLoading = useSelector((state) => state.auth.loading)
    const authStatus = useSelector((state) => state.auth.status);
    
    const dispatch = useDispatch();

    // useEffect(() => {
    //     if (!authStatus) {
    //         dispatch(getCurrentUser());
    //     }
    // }, []);

    useEffect(() => {
        if (!authentication && authStatus !== authentication) {
            return;
        }
    }, [ authStatus, authentication, navigate]);
    
    // if (authLoading) {
    //     return <Spinner/>
    //      // Show loading spinner while checking authentication status
    // }

    // useEffect(() => {
    //     if (!authentication && authStatus !== authentication) {
    //         return
    //     }
    // }, [authStatus, authentication, navigate]);


    if ( !authLoading && (authentication && authStatus !== authentication)) {
        // return <>
        // <Spinner/>
        // <LoginPopup/>
        // </>
        return <LoginPopup />;
    }

    return children;

}

export default AuthLayout;
