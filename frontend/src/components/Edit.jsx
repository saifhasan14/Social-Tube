import React, { useState, useEffect } from "react";

function Edit({ initialContent, onCancel, onSave }) {
    const [editedContent, setEditedContent] = useState(initialContent);
    const [rows, setRows] = useState(1); // Default rows to 1

    useEffect(() => {
        // Count the number of lines in the content
        const lines = editedContent.split("\n").length;
        // Set rows to minimum 4 or the number of lines, whichever is smaller
        setRows(Math.min(lines, 4));
    }, [editedContent]);

    const handleSave = () => {
        onSave(editedContent);
    };

    return (
        <div className="w-full text-sm">
            <textarea
                className="bg-[#222222] outline-none border-b w-3/4 p-2 text-white resize-none"
                value={editedContent}
                autoFocus
                onChange={(e) => setEditedContent(e.target.value)}
                rows={rows}
            />
            <div className="space-x-4 mt-3 w-3/4 inline-flex justify-end items-center">
                <span
                    className="bg-[#222222] py-1 px-3 font-normal rounded-lg hover:bg-black cursor-pointer"
                    onClick={onCancel}
                >
                    Cancel
                </span>
                <button
                    onClick={handleSave}
                    className="bg-[#222222] py-1 px-3 font-normal rounded-lg hover:bg-black cursor-pointer"
                >
                    Save
                </button>
            </div>
        </div>
    );
}

export default Edit;
