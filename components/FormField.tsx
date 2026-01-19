import React from "react";

interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    touched?: boolean;
    helpText?: string;
    children: React.ReactNode;
}

export default function FormField({
    label,
    required = false,
    error,
    touched,
    helpText,
    children,
}: FormFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {helpText && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {helpText}
                </p>
            )}
            {touched && error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}
