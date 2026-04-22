import React from 'react';

const Input = ({
    label,
    icon: Icon,
    type = 'text',
    value,
    onChange,
    required = false,
    placeholder,
    className = '',
    ...props
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative group/input">
                {Icon && (
                    <Icon
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-gold transition-colors"
                        size={20}
                    />
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 ${Icon ? 'pl-12' : 'pl-4'} pr-4 text-white font-medium placeholder:text-white/10 focus:border-gold/50 focus:bg-white/[0.05] outline-none transition-all`}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;
