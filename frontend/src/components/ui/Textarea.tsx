import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, name, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && <label htmlFor={name} className="label">{label}</label>}
        <textarea
          ref={ref}
          id={name}
          name={name}
          className={`input ${error ? 'border-red-500' : ''} ${className || ''}`}
          style={{ minHeight: '120px', resize: 'vertical' }}
          {...props}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
