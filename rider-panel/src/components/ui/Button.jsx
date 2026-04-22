import React from 'react';

const Button = ({
    children,
    type = 'button',
    disabled = false,
    loading = false,
    size = 'md',
    icon: Icon,
    className = '',
    ...props
}) => {
    const sizeClasses = {
        sm: 'py-2 px-4 text-xs',
        md: 'py-3 px-6 text-sm',
        lg: 'py-4 px-8 text-base'
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`
                relative bg-gold hover:bg-yellow-400 text-[#0f1115] 
                font-bold uppercase tracking-widest transition-all 
                shadow-xl shadow-gold/10 flex items-center justify-center gap-3 
                active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                ${sizeClasses[size] || sizeClasses.md}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-[#0f1115]/30 border-t-[#0f1115] rounded-full animate-spin"></div>
            ) : (
                <>
                    {Icon && <Icon size={20} />}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
