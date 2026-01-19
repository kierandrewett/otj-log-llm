"use client";

import React from "react";

interface DateInputWithButtonsProps {
    value: string;
    onChange: (value: string) => void;
    onSetYesterday: () => void;
    onSetToday: () => void;
    onAdjust: (days: number) => void;
}

export default function DateInputWithButtons({
    value,
    onChange,
    onSetYesterday,
    onSetToday,
    onAdjust,
}: DateInputWithButtonsProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date <span className="text-red-500">*</span>
            </label>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="input-field"
                required
            />
            <div className="flex items-center justify-between gap-4">
                <small className="text-gray-500 font-medium dark:text-gray-400">
                    {formatDate(value)}
                </small>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => onAdjust(-1)}
                        className="small-button"
                    >
                        -1 day
                    </button>
                    <button
                        type="button"
                        onClick={onSetToday}
                        className="small-button"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={() => onAdjust(1)}
                        className="small-button"
                    >
                        +1 day
                    </button>
                </div>
            </div>
        </div>
    );
}
