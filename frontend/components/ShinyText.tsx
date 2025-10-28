import React from "react";
import { Button } from "./ui/button";

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
    color?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({
    text,
    disabled = false,
    speed = 5,
    className = "",
    color = "text-lime-100",
}) => {
    const animationDuration = `${speed}s`;

    const gradient =
        "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)";

    return (
        <span className={`relative inline-block ${className}`}>
            <span className={`${color}`}>{text}</span>
            {!disabled && (
                <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-clip-text text-transparent animate-shine pointer-events-none"
                    style={{
                        backgroundImage: gradient,
                        backgroundSize: "200% 100%",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        animationDuration,
                    }}
                >
                    {text}
                </span>
            )}
        </span>
    );
};

export default ShinyText;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       keyframes: {
//         shine: {
//           '0%': { 'background-position': '100%' },
//           '100%': { 'background-position': '-100%' },
//         },
//       },
//       animation: {
//         shine: 'shine 5s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// };
