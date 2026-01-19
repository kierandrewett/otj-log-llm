"use client";

import React, { useState } from "react";
import title from "title";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import QuickFillSection from "./QuickFillSection";

interface QuickFillInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSave?: (value: string) => void;
    onDelete?: (value: string) => void;
    savedOptions: string[];
    builtInOptions?: string[];
    placeholder: string;
    required?: boolean;
    type?: "text" | "textarea";
    rows?: number;
    showTitleCase?: boolean;
}

export default function QuickFillInput({
    label,
    value,
    onChange,
    onSave,
    onDelete,
    savedOptions,
    builtInOptions = [],
    placeholder,
    required = false,
    type = "text",
    rows = 1,
    showTitleCase = false,
}: QuickFillInputProps) {
    const [pulse, setPulse] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [originalValue, setOriginalValue] = useState<string | null>(null);
    const [selectionMade, setSelectionMade] = useState(false);

    const handleQuickFill = (selectedValue: string) => {
        onChange(selectedValue);
        setSelectionMade(true);
        setOriginalValue(null);
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
    };

    const handleMouseEnter = (option: string) => {
        if (value.toLowerCase() === option.toLowerCase()) {
            return;
        }
        if (originalValue === null) {
            setOriginalValue(value);
        }
        onChange(option);
    };

    const handleMouseLeave = () => {
        if (originalValue !== null) {
            onChange(originalValue);
        }
    };

    const handleDropdownOpenChange = (open: boolean) => {
        setDropdownOpen(open);
        if (open) {
            setOriginalValue(value);
            setSelectionMade(false);
        } else {
            if (!selectionMade && originalValue !== null) {
                onChange(originalValue);
            }
            setOriginalValue(null);
            setSelectionMade(false);
        }
    };

    const handleTitleCase = () => {
        if (value) {
            onChange(title(value));
            setPulse(true);
            setTimeout(() => setPulse(false), 500);
        }
    };

    const handleBlur = () => {
        if (onSave && value && value.trim()) {
            const titleCasedValue = title(value.trim());
            // Only save if it doesn't already exist (case-insensitive)
            const exists = savedOptions.some(
                (opt) => opt.toLowerCase() === titleCasedValue.toLowerCase(),
            );
            if (!exists) {
                onSave(titleCasedValue);
            }
            // Update the input to title case
            if (titleCasedValue !== value) {
                onChange(titleCasedValue);
            }
        }
    };

    const handleDelete = (optionToDelete: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (
            onDelete &&
            confirm(`Delete "${optionToDelete}" from quick fill?`)
        ) {
            onDelete(optionToDelete);
        }
    };

    // Dedupe by converting to Set based on lowercase comparison, keep original case
    const deduped = savedOptions.filter(
        (opt, index, self) =>
            opt &&
            opt.trim() &&
            self.findIndex((o) => o.toLowerCase() === opt.toLowerCase()) ===
                index,
    );
    const filteredOptions = deduped.sort();

    // Separate built-in and user-generated options
    const builtInFiltered = filteredOptions.filter((opt) =>
        builtInOptions.some(
            (built) => built.toLowerCase() === opt.toLowerCase(),
        ),
    );
    const userGenerated = filteredOptions.filter(
        (opt) =>
            !builtInOptions.some(
                (built) => built.toLowerCase() === opt.toLowerCase(),
            ),
    );

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {type === "textarea" ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    rows={rows}
                    className={`input-field transition-all resize-none ${
                        pulse ? "animate-scaleUp ring-2 ring-blue-400" : ""
                    }`}
                    required={required}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`input-field transition-all ${
                        pulse ? "animate-scaleUp ring-2 ring-blue-400" : ""
                    }`}
                    required={required}
                />
            )}

            {filteredOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <DropdownMenu.Root
                        open={dropdownOpen}
                        onOpenChange={handleDropdownOpenChange}
                    >
                        <DropdownMenu.Trigger asChild>
                            <button
                                type="button"
                                className={`small-button text-xs px-2 py-1 rounded transition-colors ${
                                    dropdownOpen
                                        ? "bg-blue-100 hover:bg-blue-200 active:bg-blue-200 border border-blue-400 text-blue-700"
                                        : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray text-gray-700 border border-transparent"
                                }`}
                            >
                                <span className="mr-1">+</span> Quick fill
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="min-w-[240px] max-h-[400px] overflow-y-auto bg-white dark:bg-[rgb(30,30,30)] rounded-md border border-gray-200 dark:border-gray-700/50 shadow-2xl p-0.5 z-50 animate-dropdownSlide"
                                side="bottom"
                                align="start"
                                sideOffset={5}
                            >
                                <DropdownMenu.Arrow className="fill-white stroke-gray-300 dark:stroke-gray-600 dark:fill-[rgb(30,30,30)] stroke-1 w-4 h-1.5" />

                                <QuickFillSection
                                    title="Built-in"
                                    options={builtInFiltered}
                                    currentValue={value}
                                    onSelect={handleQuickFill}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    showDelete={false}
                                />

                                <QuickFillSection
                                    title="Your saved"
                                    options={userGenerated}
                                    currentValue={value}
                                    onSelect={handleQuickFill}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    onDelete={handleDelete}
                                    showDelete={true}
                                />
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                    {showTitleCase && (
                        <button
                            type="button"
                            onClick={handleTitleCase}
                            disabled={!value}
                            className="small-button disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Title case
                        </button>
                    )}
                </div>
            )}
            {filteredOptions.length === 0 && showTitleCase && (
                <button
                    type="button"
                    onClick={handleTitleCase}
                    disabled={!value}
                    className="small-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Title case
                </button>
            )}
        </div>
    );
}
