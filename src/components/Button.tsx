import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'purple' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400',
    secondary: 'border border-slate-600 text-slate-300 hover:bg-slate-700/40 hover:border-slate-500',
    success: 'border border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400',
    warning: 'border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400',
    danger: 'border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400',
    ghost: 'border border-slate-600 text-slate-300 hover:bg-slate-700/40 hover:border-slate-500',
    purple: 'border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400',
    outline: 'border border-slate-600 text-slate-300 hover:bg-slate-700/40 hover:border-slate-500',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export function Button({
    children,
    variant = 'outline',
    size = 'md',
    icon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-transparent ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={disabled}
            {...props}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
        </button>
    );
}
