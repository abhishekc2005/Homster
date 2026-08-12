import React, { forwardRef } from 'react';
import { useBranding } from '../../context/BrandingContext';

/**
 * Centralized Logo Component
 * Usage: <Logo className="h-8 w-auto" />
 * Supports ref for animations
 * Logo URL is dynamic — controlled from Admin Panel Settings
 */
const Logo = forwardRef(({ className = "h-8 w-auto", ...props }, ref) => {
  const { logoUrl } = useBranding();

  return (
    <img
      ref={ref}
      src={logoUrl}
      alt="Cleaning Expert Services"
      className={`${className} aspect-square object-cover rounded-full shadow-sm border border-gray-100`}
      {...props}
    />
  );
});

Logo.displayName = 'Logo';

export default Logo;
