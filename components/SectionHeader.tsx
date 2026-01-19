import React from "react";

interface SectionHeaderProps {
    title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
    return (
        <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
            </h3>
        </div>
    );
}
