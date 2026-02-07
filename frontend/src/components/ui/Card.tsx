import React from 'react';

export const Card = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`card ${className || ''}`} {...props}>
      {children}
    </div>
  );
};
