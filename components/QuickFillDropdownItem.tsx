import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface QuickFillDropdownItemProps {
    option: string;
    isSelected: boolean;
    onSelect: (option: string) => void;
    onMouseEnter: (option: string) => void;
    onMouseLeave: () => void;
    onDelete?: (option: string, e: React.MouseEvent) => void;
    showDelete?: boolean;
}

export default function QuickFillDropdownItem({
    option,
    isSelected,
    onSelect,
    onMouseEnter,
    onMouseLeave,
    onDelete,
    showDelete = false,
}: QuickFillDropdownItemProps) {
    return (
        <DropdownMenu.Item
            className="flex items-center justify-between px-2 py-1.5 text-sm rounded outline-none cursor-pointer transition-colors group text-gray-900 dark:text-gray-200 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            onSelect={() => onSelect(option)}
            onMouseEnter={() => onMouseEnter(option)}
            onMouseLeave={onMouseLeave}
        >
            <span
                className="text-blue-600 dark:text-blue-400 text-sm mr-2"
                style={{
                    opacity: isSelected ? 1 : 0,
                }}
            >
                ✓
            </span>
            <span className="flex-1 pr-2">{option}</span>

            {showDelete && onDelete && (
                <button
                    type="button"
                    onClick={(e) => onDelete(option, e)}
                    className="ml-2 px-1.5 py-0.5 text-xs font-medium rounded transition-colors flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-white hover:bg-red-600 bg-gray-100 dark:bg-gray-500/10 border-gray-200 dark:border-gray-700 hover:border-red-600"
                    title="Delete"
                >
                    ✕
                </button>
            )}
        </DropdownMenu.Item>
    );
}
