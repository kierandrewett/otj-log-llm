"use client";

import React, { useState, useEffect } from "react";
import { FormikProps } from "formik";
import { FormData, SavedLog } from "@/lib/types";
import { config, STORAGE_KEYS, getExportFileName } from "@/lib/config";
import QuickFillInput from "@/components/QuickFillInput";
import DateInputWithButtons from "@/components/DateInputWithButtons";
import ActivityBuilder from "@/components/ActivityBuilder";
import FileUpload from "@/components/FileUpload";
import FormField from "@/components/FormField";
import FormSelect from "@/components/FormSelect";
import SectionHeader from "@/components/SectionHeader";
import ThemeToggle from "@/components/ThemeToggle";
import {
    getTodayISO,
    getYesterdayISO,
    adjustDateISO,
    calculateDurationFromTimes,
} from "@/lib/dateUtils";
import Link from "next/link";
import SavedLogs from "./SavedLogs";

interface FormSectionProps {
    formik: FormikProps<FormData>;
    onLoadLog: (log: SavedLog) => void;
}

export default function FormSection({ formik, onLoadLog }: FormSectionProps) {
    const { values, setFieldValue, touched, errors } = formik;
    const selectedMethod = config.trainingMethods.find(
        (m) => m.id === values.method,
    );

    // LocalStorage state
    const [savedLogs, setSavedLogs] = useState<SavedLog[]>([]);
    const [savedActivities, setSavedActivities] = useState<string[]>(
        config.builtInActivities,
    );
    const [savedWhoOptions, setSavedWhoOptions] = useState<string[]>(
        config.builtInWho,
    );
    const [savedWhereOptions, setSavedWhereOptions] = useState<string[]>(
        config.builtInWhere,
    );

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
            if (storedLogs) setSavedLogs(JSON.parse(storedLogs));

            const storedActivities = localStorage.getItem(
                STORAGE_KEYS.ACTIVITIES,
            );
            if (storedActivities) {
                const userActivities = JSON.parse(storedActivities);
                setSavedActivities([
                    ...config.builtInActivities,
                    ...userActivities,
                ]);
            }

            const storedWho = localStorage.getItem(STORAGE_KEYS.WHO);
            if (storedWho) {
                const userWho = JSON.parse(storedWho);
                setSavedWhoOptions([...config.builtInWho, ...userWho]);
            }

            const storedWhere = localStorage.getItem(STORAGE_KEYS.WHERE);
            if (storedWhere) {
                const userWhere = JSON.parse(storedWhere);
                setSavedWhereOptions([...config.builtInWhere, ...userWhere]);
            }
        }
    }, []);

    // Save to localStorage when state changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(savedLogs));
        }
    }, [savedLogs]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userGeneratedActivities = savedActivities.filter(
                (opt) =>
                    !config.builtInActivities.some(
                        (built) => built.toLowerCase() === opt.toLowerCase(),
                    ),
            );
            localStorage.setItem(
                STORAGE_KEYS.ACTIVITIES,
                JSON.stringify(userGeneratedActivities),
            );
        }
    }, [savedActivities]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userGeneratedWho = savedWhoOptions.filter(
                (opt) =>
                    !config.builtInWho.some(
                        (built) => built.toLowerCase() === opt.toLowerCase(),
                    ),
            );
            localStorage.setItem(
                STORAGE_KEYS.WHO,
                JSON.stringify(userGeneratedWho),
            );
        }
    }, [savedWhoOptions]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userGeneratedWhere = savedWhereOptions.filter(
                (opt) =>
                    !config.builtInWhere.some(
                        (built) => built.toLowerCase() === opt.toLowerCase(),
                    ),
            );
            localStorage.setItem(
                STORAGE_KEYS.WHERE,
                JSON.stringify(userGeneratedWhere),
            );
        }
    }, [savedWhereOptions]);

    // Handlers
    const handleSaveActivity = (activity: string) => {
        const titleCased = activity.trim();
        const exists = savedActivities.some(
            (a) => a.toLowerCase() === titleCased.toLowerCase(),
        );
        if (!exists) {
            setSavedActivities((prev) => [...prev, titleCased]);
        }
    };

    const handleDeleteActivity = (activity: string) => {
        setSavedActivities((prev) => prev.filter((a) => a !== activity));
    };

    const handleSaveWho = (who: string) => {
        const titleCased = who.trim();
        const exists = savedWhoOptions.some(
            (w) => w.toLowerCase() === titleCased.toLowerCase(),
        );
        if (!exists) {
            setSavedWhoOptions((prev) => [...prev, titleCased]);
        }
    };

    const handleDeleteWho = (who: string) => {
        setSavedWhoOptions((prev) => prev.filter((w) => w !== who));
    };

    const handleSaveWhere = (where: string) => {
        const titleCased = where.trim();
        const exists = savedWhereOptions.some(
            (w) => w.toLowerCase() === titleCased.toLowerCase(),
        );
        if (!exists) {
            setSavedWhereOptions((prev) => [...prev, titleCased]);
        }
    };

    const handleDeleteWhere = (where: string) => {
        setSavedWhereOptions((prev) => prev.filter((w) => w !== where));
    };

    const handleDeleteLog = (id: string) => {
        setSavedLogs((prev) => prev.filter((l) => l.id !== id));
    };

    const handleExportLogs = () => {
        const dataStr = JSON.stringify(
            savedLogs,
            null,
            config.exportJsonSpacing,
        );
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = getExportFileName();
        link.click();
        URL.revokeObjectURL(url);
    };

    React.useEffect(() => {
        const duration = calculateDurationFromTimes(
            values.startTime,
            values.endTime,
        );
        if (duration > 0) {
            setFieldValue("duration", duration);
        }
    }, [values.startTime, values.endTime, setFieldValue]);

    return (
        <div className="[@media(max-width:1500px)]:max-h-screen [@media(max-width:1500px)]:h-screen overflow-auto flex flex-col bg-white dark:bg-[rgb(10,10,10)] [@media(min-width:1500px)]:rounded-lg [@media(min-width:1500px)]:border border-gray-200 dark:border-[rgb(30,30,30)] shadow-sm">
            <div className="flex-1 [@media(min-width:1500px)]:overflow-auto">
                <div className="bg-white dark:bg-[rgb(10,10,10)] text-gray-900 dark:text-gray-100">
                    <div className="backdrop-blur-xl px-4 py-3 border-b sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-[rgb(15,15,15,0.95)] dark:to-[rgb(20,20,20,0.95)] border-gray-200 dark:border-[rgb(30,30,30)]">
                        <Link
                            href="/"
                            className="text-xl font-semibold hover:underline text-blue-800 dark:text-blue-400"
                        >
                            Off the Job Record
                        </Link>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        confirm(
                                            "Are you sure you want to reset the form? All unsaved data will be lost.",
                                        )
                                    ) {
                                        formik.resetForm();
                                    }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors bg-white dark:bg-[rgb(30,30,30)] border-gray-300 dark:border-[rgb(50,50,50)] hover:bg-gray-100 dark:hover:bg-[rgb(40,40,40)] active:bg-gray-200 dark:active:bg-[rgb(60,60,60)] text-gray-700 dark:text-gray-200"
                            >
                                Reset Form
                            </button>
                            <ThemeToggle />
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        <SectionHeader title="Date & Time" />

                        {/* Date */}
                        <DateInputWithButtons
                            value={values.date}
                            onChange={(value) => setFieldValue("date", value)}
                            onSetYesterday={() =>
                                setFieldValue("date", getYesterdayISO())
                            }
                            onSetToday={() =>
                                setFieldValue("date", getTodayISO())
                            }
                            onAdjust={(days) =>
                                setFieldValue(
                                    "date",
                                    adjustDateISO(values.date, days),
                                )
                            }
                        />

                        {/* Time & Duration */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField label="Start Time" required>
                                    <input
                                        type="time"
                                        value={values.startTime}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "startTime",
                                                e.target.value,
                                            )
                                        }
                                        onBlur={formik.handleBlur}
                                        name="startTime"
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="End Time" required>
                                    <input
                                        type="time"
                                        value={values.endTime}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "endTime",
                                                e.target.value,
                                            )
                                        }
                                        onBlur={formik.handleBlur}
                                        name="endTime"
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField
                                    label="Calculated Duration (hours)"
                                    required
                                >
                                    <input
                                        type="text"
                                        step="0.5"
                                        min="0"
                                        readOnly
                                        value={values.duration}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "duration",
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        onBlur={formik.handleBlur}
                                        name="duration"
                                        disabled
                                        className="input-field w-max opacity-75"
                                        required
                                    />
                                </FormField>
                            </div>

                            {touched.startTime && errors.startTime && (
                                <p className="text-sm text-red-500">
                                    {errors.startTime}
                                </p>
                            )}
                            {touched.endTime && errors.endTime && (
                                <p className="text-sm text-red-500">
                                    {errors.endTime}
                                </p>
                            )}
                            {touched.duration && errors.duration && (
                                <p className="text-sm text-red-500">
                                    {errors.duration}
                                </p>
                            )}

                            {touched.startTime &&
                                touched.endTime &&
                                values.startTime <= values.endTime ===
                                    false && (
                                    <p className="text-sm text-red-500">
                                        Start time cannot be later than end
                                        time.
                                    </p>
                                )}
                        </div>

                        {/* Activity Section */}
                        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <SectionHeader title="Details" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Training Method */}
                                <div className="space-y-2">
                                    <FormSelect
                                        label="Training Method"
                                        value={values.method}
                                        onChange={(value) =>
                                            setFieldValue("method", value)
                                        }
                                        onBlur={formik.handleBlur}
                                        options={config.trainingMethods.map(
                                            (method) => ({
                                                value: method.id,
                                                label: `${method.emoji} ${method.label}`,
                                            }),
                                        )}
                                        placeholder="Select training method..."
                                        name="method"
                                        required
                                    />
                                    {selectedMethod && (
                                        <p className="text-sm text-gray-600 italic animate-fadeIn dark:text-gray-400">
                                            {selectedMethod.description}
                                        </p>
                                    )}
                                </div>

                                <QuickFillInput
                                    label="Activity Name"
                                    value={values.otherActivity}
                                    onChange={(value) =>
                                        setFieldValue("otherActivity", value)
                                    }
                                    onSave={handleSaveActivity}
                                    onDelete={handleDeleteActivity}
                                    savedOptions={savedActivities}
                                    builtInOptions={config.builtInActivities}
                                    placeholder="What activity or work did you complete?"
                                    required
                                    showTitleCase
                                />
                            </div>

                            {/* Activity Builder */}
                            <ActivityBuilder
                                activities={values.activityTypes}
                                onChange={(activities) =>
                                    setFieldValue("activityTypes", activities)
                                }
                            />
                        </div>

                        {/* File Upload Section */}
                        <FileUpload
                            files={values.uploadedFiles}
                            onChange={(files) =>
                                setFieldValue("uploadedFiles", files)
                            }
                        />

                        {/* Context Section */}
                        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <SectionHeader title="Context" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <QuickFillInput
                                    label="Who"
                                    value={values.who}
                                    onChange={(value) =>
                                        setFieldValue("who", value)
                                    }
                                    onSave={handleSaveWho}
                                    onDelete={handleDeleteWho}
                                    savedOptions={savedWhoOptions}
                                    builtInOptions={config.builtInWho}
                                    placeholder="Who led/supported?"
                                    required
                                    showTitleCase
                                />

                                <QuickFillInput
                                    label="Where"
                                    value={values.where}
                                    onChange={(value) =>
                                        setFieldValue("where", value)
                                    }
                                    onSave={handleSaveWhere}
                                    onDelete={handleDeleteWhere}
                                    savedOptions={savedWhereOptions}
                                    builtInOptions={config.builtInWhere}
                                    placeholder="Location"
                                    required
                                    showTitleCase
                                />

                                <FormSelect
                                    label="Validated By"
                                    value={values.validatedBy}
                                    onChange={(value) =>
                                        setFieldValue("validatedBy", value)
                                    }
                                    onBlur={formik.handleBlur}
                                    options={config.validationOptions}
                                    name="validatedBy"
                                    helpText="Who will validate this log?"
                                    required
                                />
                            </div>

                            {/* Custom Prompt */}
                            <QuickFillInput
                                label="Additional Context"
                                value={values.prompt}
                                onChange={(value) =>
                                    setFieldValue("prompt", value)
                                }
                                savedOptions={[]}
                                placeholder="Add any additional context for the AI..."
                                type="textarea"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Saved Logs at Bottom */}
            <div className="sticky bottom-0 border-t shadow-[0_-2px_8px_rgba(0,0,0,0.05)] p-3 bg-white dark:bg-[rgb(15,15,15)] border-gray-200 dark:border-[rgb(30,30,30)]">
                <SavedLogs
                    logs={savedLogs}
                    onLoadLog={onLoadLog}
                    onDeleteLog={handleDeleteLog}
                    onExport={handleExportLogs}
                />
            </div>
        </div>
    );
}
