import React, { useState } from "react";
import {
    BiHistory,
    BiLike,
    CiSettings,
    HiOutlineVideoCamera,
    IoFolderOutline,
    RiHome6Line,
    TbUserCheck,
} from "../icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IoMdLogOut } from "react-icons/io";
import { userLogout } from "../../store/Slices/authSlice";
import Logo from "../Logo";
import { SlMenu } from "react-icons/sl";
import { MdClose } from "react-icons/md";

function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const username = useSelector((state) => state.auth?.userData?.username);
    const sidebarTopItems = [
        {
            icon: <RiHome6Line size={25} />,
            title: "Home",
            url: "/",
        },
        {
            icon: <BiLike size={25} />,
            title: "Liked Videos",
            url: "/liked-videos",
        },
        {
            icon: <BiHistory size={25} />,
            title: "History",
            url: "/history",
        },
        {
            icon: <HiOutlineVideoCamera size={25} />,
            title: "My Content",
            url: `/channel/${username}`,
        },
        {
            icon: <IoFolderOutline size={25} />,
            title: "Collections",
            url: "/collections",
        },
        {
            icon: <TbUserCheck size={25} />,
            title: "Subscriptions",
            url: "/subscriptions",
        },
    ];

    const bottomBarItems = [
        {
            icon: <RiHome6Line size={25} />,
            title: "Home",
            url: "/",
        },
        {
            icon: <BiHistory size={25} />,
            title: "History",
            url: "/history",
        },
        {
            icon: <IoFolderOutline size={25} />,
            title: "Collections",
            url: "/collections",
        },
        {
            icon: <TbUserCheck size={25} />,
            title: "Subscriptions",
            url: "/subscriptions",
        },
    ];

    const logout = async () => {
        await dispatch(userLogout());
        navigate("/");
    };

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <>
            <div className="sm:block hidden">
                <div className="text-white lg:w-56 md:w-44 w-16 sm:p-3 p-2 border-slate-600 border-r h-screen flex flex-col justify-between">
                    <div className="flex flex-col gap-4 mt-5">
                        {sidebarTopItems.map((item) => (
                            <NavLink
                                to={item.url}
                                key={item.title}
                                className={({ isActive }) => (isActive ? "bg-purple-500" : "")}
                            >
                                <div className="flex items-center gap-2 justify-center sm:justify-start hover:bg-purple-500 cursor-pointer py-1 px-2 border border-slate-600">
                                    {item.icon}
                                    <span className="text-base hidden md:block">
                                        {item.title}
                                    </span>
                                </div>
                            </NavLink>
                        ))}
                    </div>

                    <div className="space-y-4 mb-10">
                        {username && (
                            <div
                                className="flex items-center gap-2 justify-center sm:justify-start hover:bg-purple-500 cursor-pointer py-1 px-2 border border-slate-600"
                                onClick={() => logout()}
                            >
                                <IoMdLogOut size={25} />
                                <span className="text-base hidden md:block">Logout</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 justify-center sm:justify-start hover:bg-purple-500 cursor-pointer py-1 px-2 border border-slate-600">
                            <CiSettings size={25} />
                            <span className="text-base hidden md:block">Settings</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* for mobile sidebar is bottom bar*/}
            <div className="border-t-2 text-white h-16 sm:hidden z-20 p-1 w-full flex justify-around fixed bottom-0 bg-[#0E0F0F]">
                {bottomBarItems.map((item) => (
                    <NavLink
                        to={item.url}
                        key={item.title}
                        className={({ isActive }) => (isActive ? "text-purple-500" : "")}
                    >
                        <div className="flex flex-col items-center gap-1 cursor-pointer p-1">
                            {item.icon}
                            <span className="text-sm">{item.title}</span>
                        </div>
                    </NavLink>
                ))}
            </div>
        </>
    );
}

export default Sidebar;

{/* <div className="sm:block hidden">
    <div
        className={`text-white fixed top-0 left-0 h-screen bg-[#0F0F0F] z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out w-64`}
    >
        <div className="flex justify-between items-center p-4 border-b border-gray-600">
            <Logo />
            <MdClose
                size={30}
                className="text-white cursor-pointer"
                onClick={toggleSidebar}
            />
        </div>
        <div className="flex flex-col gap-4 mt-5 p-4">
            {sidebarTopItems.map((item) => (
                <NavLink
                    to={item.url}
                    key={item.title}
                    className={({ isActive }) => (isActive ? "bg-purple-500" : "")}
                    onClick={toggleSidebar}
                >
                    <div className="flex items-center gap-2 justify-start hover:bg-purple-500 hover:text-white cursor-pointer py-2 px-4 border border-slate-600">
                        {item.icon}
                        <span className="text-base hidden md:block">
                            {item.title}
                        </span>
                    </div>
                </NavLink>
            ))}
        </div>
        <div className="p-4 border-t border-gray-600">
            {username && (
                <div
                    className="flex items-center gap-2 justify-start hover:bg-purple-500 hover:text-white cursor-pointer py-2 px-4 border border-slate-600"
                    onClick={() => (logout(), toggleSidebar())}
                >
                    <IoMdLogOut size={25} />
                    <span className="text-base hidden md:block">Logout</span>
                </div>
            )}
            <div
                className="flex items-center gap-2 justify-start hover:bg-purple-500 hover:text-white cursor-pointer py-2 px-4 border border-slate-600"
                onClick={toggleSidebar}
            >
                <CiSettings size={25} />
                <span className="text-base hidden md:block">Settings</span>
            </div>
        </div>
    </div>
    <div className="fixed top-4 left-4 z-50">
        <SlMenu
            size={20}
            className="text-white cursor-pointer"
            onClick={toggleSidebar}
        />
    </div>
</div> */}