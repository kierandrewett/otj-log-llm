"use client";

import React, { useState } from "react";
import { SavedLog, FormData } from "@/lib/types";

interface SavedLogsProps {
    logs: SavedLog[];
    onLoadLog: (log: SavedLog) => void;
    onDeleteLog: (id: string) => void;
    onExport: () => void;
}

export default function SavedLogs({
    logs,
    onLoadLog,
    onDeleteLog,
    onExport,
}: SavedLogsProps) {
    const [showAllLogs, setShowAllLogs] = useState(false);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const logId = e.target.value;
        if (logId) {
            const selectedLog = logs.find((log) => log.id === logId);
            if (selectedLog) {
                onLoadLog(selectedLog);
                // Reset the select to placeholder
                e.target.value = "";
            }
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this log?")) {
            onDeleteLog(id);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <label
                        htmlFor="quick-fill"
                        className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap uppercase tracking-wide"
                    >
                        Load Saved:
                    </label>
                    <select
                        id="quick-fill"
                        onChange={handleSelectChange}
                        defaultValue=""
                        disabled={logs.length === 0}
                        className="input-field text-sm flex-1"
                    >
                        <option value="" disabled>
                            {logs.length === 0
                                ? "No saved logs yet"
                                : `Select a saved log (${logs.length})`}
                        </option>
                        {logs.map((log) => {
                            const date = new Date(
                                log.formData.date,
                            ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            });
                            const preview =
                                log.formData.otherActivity.substring(0, 40);
                            const displayText = `${date} - ${preview}${log.formData.otherActivity.length > 40 ? "..." : ""}`;
                            return (
                                <option key={log.id} value={log.id}>
                                    {displayText}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div className="flex gap-1.5">
                    {logs.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowAllLogs(!showAllLogs)}
                            className="small-button font-medium"
                        >
                            {showAllLogs ? "Hide" : "Manage"}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onExport}
                        disabled={logs.length === 0}
                        className="small-button font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Export All
                    </button>
                </div>
            </div>

            {/* Expanded logs list */}
            {showAllLogs && logs.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                    {logs.map((log) => {
                        const date = new Date(
                            log.formData.date,
                        ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        });
                        const preview = log.formData.otherActivity.substring(
                            0,
                            60,
                        );
                        return (
                            <div
                                key={log.id}
                                className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-[rgb(30,30,30)] border border-gray-200 dark:border-gray-800 rounded-md hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
                            >
                                <button
                                    type="button"
                                    onClick={() => onLoadLog(log)}
                                    className="flex-1 text-left"
                                >
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                        {date} • {log.formData.duration}h
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {preview}
                                        {log.formData.otherActivity.length >
                                            60 && "..."}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleDelete(log.id, e)}
                                    className="small-button text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete log"
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
