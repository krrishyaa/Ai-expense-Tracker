import React from 'react';

export const DropdownMenu: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div className="relative" {...props}>
    {children}
  </div>
);

export const DropdownMenuTrigger: React.FC<any> = ({ asChild, children }) => <>{children}</>;

type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end' | string;
};

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(function DropdownMenuContent(
  { className = '', children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={`absolute right-0 z-50 overflow-hidden rounded-2xl border border-border bg-card shadow-lg ${className}`} {...props}>
      {children}
    </div>
  );
});

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function DropdownMenuItem(
  { className = '', children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={`px-3 py-2 text-sm text-foreground ${className}`} {...props}>
      {children}
    </div>
  );
});

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function DropdownMenuLabel(
  { className = '', children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={`px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground ${className}`} {...props}>
      {children}
    </div>
  );
});

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function DropdownMenuSeparator(
  { className = '', ...props },
  ref,
) {
  return <div ref={ref} className={`border-t border-border my-1 ${className}`} {...props} />;
});

export default DropdownMenu;
