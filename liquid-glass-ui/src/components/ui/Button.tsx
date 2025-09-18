import clsx from "clsx";
import { ReactNode, MouseEvent } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: (evt: MouseEvent) => void;
  className?: string;
  color?: "primary" | "secondary" | "tertiary" | "neutral" | "default";
  selected?: boolean;
  disabled?: boolean;
  block?: boolean;
}

export const Button = ({
  children,
  onClick,
  className = "",
  selected = false,
  disabled = false,
  block = false,
  color = "neutral",
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer select-none",
        {
          "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl": color === "primary",
          "bg-gray-700 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl": color === "secondary",
          "bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-xl": color === "tertiary",
          "bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-md hover:shadow-lg": color === "neutral",
          "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md": color === "default",
          "ring-2 ring-blue-500 ring-offset-2": selected,
          "opacity-50 cursor-not-allowed": disabled,
          "w-full": block
        },
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const ButtonLED = () => {
  return (
    <span 
      className="block w-2 h-2 rounded-full bg-black/10 transition-colors duration-150"
      style={{
        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.11), 0 1px 0 0px rgba(255,255,255,0.19)'
      }}
    />
  );
};