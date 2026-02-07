import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, name, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="w-full mb-4">
        {label && (
          <label htmlFor={name} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={name}
            name={name}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={`input ${error ? 'border-red-500' : ''} ${isPassword ? 'pr-10' : ''} ${className || ''}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-400 transition-colors bg-transparent border-0 cursor-pointer outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
