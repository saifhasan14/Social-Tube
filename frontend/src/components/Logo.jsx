import React from "react";
import { IoLogoYoutube } from "react-icons/io";
import { Link } from "react-router-dom";
function Logo({ size = "30" }) {
  return (
    <>
      <Link to={"/"} className="flex items-center gap-2">
        {/* <IoLogoYoutube
            size={size}
            color="#A855F7"
        /> */}
        <img
          src="/icons/logo.svg"
          alt="Social Tube Logo"
          style={{ width: 30, height: 35 }} // Adjust size as needed
        />
        <span className="font-bold text-lg  text-white whitespace-nowrap">
          SOCIAL TUBE
        </span>
      </Link>
    </>
  );
}

export default Logo;
