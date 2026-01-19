"use client";

import React, { useState, KeyboardEvent } from "react";

interface ActivityBuilderProps {
    activities: string[];
    onChange: (activities: string[]) => void;
}

export default function ActivityBuilder({
    activities,
    onChange,
}: ActivityBuilderProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            addActivity();
        }
    };

    const addActivity = () => {
        if (inputValue.trim() && !activities.includes(inputValue.trim())) {
            onChange([...activities, inputValue.trim()]);
            setInputValue("");
        }
    };

    const removeActivity = (index: number) => {
        onChange(activities.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add specific activities or topics you focused on during your
                    training.
                </p>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., accessibility, programming in C#, project management"
                    className="input-field flex-1"
                />
                <button
                    type="button"
                    onClick={addActivity}
                    disabled={!inputValue.trim()}
                    className="small-button font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    + Add
                </button>
            </div>

            {activities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {activities.map((activity, index) => (
                        <span
                            key={index}
                            className="inline-flex text-xs items-center gap-1 pl-2 pr-1 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                        >
                            {activity}
                            <button
                                type="button"
                                onClick={() => removeActivity(index)}
                                className="hover:bg-blue-500 active:bg-blue-800 hover:text-white rounded-2xl w-4 h-4 text-lg leading-none"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
