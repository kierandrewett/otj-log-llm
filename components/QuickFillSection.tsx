import React from "react";
import QuickFillDropdownItem from "./QuickFillDropdownItem";

interface QuickFillSectionProps {
    title: string;
    options: string[];
    currentValue: string;
    onSelect: (option: string) => void;
    onMouseEnter: (option: string) => void;
    onMouseLeave: () => void;
    onDelete?: (option: string, e: React.MouseEvent) => void;
    showDelete?: boolean;
}

export default function QuickFillSection({
    title,
    options,
    currentValue,
    onSelect,
    onMouseEnter,
    onMouseLeave,
    onDelete,
    showDelete = false,
}: QuickFillSectionProps) {
    if (options.length === 0) return null;

    return (
        <>
            <div className="mx-2 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase border-b border-gray-300 dark:border-gray-700 tracking-wider my-1">
                {title}
            </div>
            {options.map((option, idx) => {
                const isSelected =
                    currentValue.toLowerCase() === option.toLowerCase();
                return (
                    <QuickFillDropdownItem
                        key={`${title}-${idx}`}
                        option={option}
                        isSelected={isSelected}
                        onSelect={onSelect}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onDelete={onDelete}
                        showDelete={showDelete}
                    />
                );
            })}
        </>
    );
}
