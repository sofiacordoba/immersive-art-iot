import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    className?: string;
    labelClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = "", labelClassName = "", ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className={`block text-sm font-medium mb-1 ${labelClassName}`}>
            {label}
        </label>
        <input
            id={id}
            className={`block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
            {...props}
        />
    </div>
);

export default Input; 