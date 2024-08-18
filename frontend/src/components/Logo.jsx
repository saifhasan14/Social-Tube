import React from "react";
import { IoLogoYoutube } from "react-icons/io";
import { Link } from "react-router-dom";

function Logo({ size = "30" }) {
    return (
        <>
            <Link to={'/'} className="flex items-center gap-2">
                <IoLogoYoutube
                    size={size}
                    color="#A855F7"
                />
                <span className="font-bold text-white whitespace-nowrap">SOCIAL TUBE</span>
            </Link>
        </>
    );
}

export default Logo;