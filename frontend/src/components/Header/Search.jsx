import React from "react";
import Input from "../Input";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

function Search() {
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();

    const search = (data) => {
        const query = data?.query;
        navigate(`/search/${query}`);
    };

    return (
        <>
            <form onSubmit={handleSubmit(search)} className="relative">
            <input
                type="text"
                placeholder="Search"
                {...register("query", { required: true })}
                className="w-full py-2 pl-3 pr-4 rounded bg-gray-800 text-white focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch size={20} />
            </button>
            </form>
        </>
    );
}

export default Search;
