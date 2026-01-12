import Link from "next/link";

export default function Button({
    children,
    variant = "primary",
    size = "md",
    href,
    onClick,
    disabled = false,
    className = "",
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary:
            "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-lg shadow-slate-900/20 hover:scale-105",
        secondary:
            "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-lg shadow-blue-500/20 hover:scale-105",
        outline:
            "border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-500",
        ghost:
            "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-500",
        gradient:
            "gradient-bg text-white hover:opacity-90 focus:ring-blue-500 shadow-lg shadow-blue-500/30 hover:scale-105",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg",
        xl: "px-10 py-4 text-xl",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`;

    if (href) {
        return (
            <Link href={href} className={combinedClassName} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={combinedClassName}
            {...props}
        >
            {children}
        </button>
    );
}
