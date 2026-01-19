import React from "react";
import FormField from "./FormField";

interface SelectOption {
    value: string;
    label: string;
}

interface FormSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
    name?: string;
    error?: string;
    touched?: boolean;
    helpText?: string;
}

export default function FormSelect({
    label,
    value,
    onChange,
    onBlur,
    options,
    placeholder = "Select...",
    required = false,
    name,
    error,
    touched,
    helpText,
}: FormSelectProps) {
    return (
        <FormField
            label={label}
            required={required}
            error={error}
            touched={touched}
            helpText={helpText}
        >
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                name={name}
                className="input-field"
                required={required}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </FormField>
    );
}
