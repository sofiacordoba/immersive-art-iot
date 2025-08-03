import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => (
    <button
        className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
        {...props}
    >
        {children}
    </button>
);

export default Button; 