import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { configService } from '../services/configService';

const FALLBACK_LOGO = '/cleaning-expert-logo.png';
const CACHE_KEY = 'homster_branding';

const BrandingContext = createContext({
  logoUrl: FALLBACK_LOGO,
  faviconUrl: FALLBACK_LOGO,
});

/**
 * BrandingProvider
 * Fetches companyLogo/companyFavicon from the public config API once on mount.
 * Caches in sessionStorage for instant loads on refresh.
 * Dynamically updates the <link rel="icon"> in document.head.
 */
export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(() => {
    // Try loading from sessionStorage for instant render
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          logoUrl: parsed.logoUrl || FALLBACK_LOGO,
          faviconUrl: parsed.faviconUrl || parsed.logoUrl || FALLBACK_LOGO,
        };
      }
    } catch {
      // ignore parse errors
    }
    return { logoUrl: FALLBACK_LOGO, faviconUrl: FALLBACK_LOGO };
  });

  // Update the favicon <link> element in the DOM
  const updateFavicon = useCallback((url) => {
    if (!url) return;
    const link = document.getElementById('dynamic-favicon') || document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = url;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchBranding = async () => {
      try {
        const res = await configService.getSettings();
        if (cancelled) return;

        if (res.success && res.settings) {
          const logoUrl = res.settings.companyLogo || FALLBACK_LOGO;
          const faviconUrl = res.settings.companyFavicon || logoUrl;

          setBranding({ logoUrl, faviconUrl });
          updateFavicon(faviconUrl);

          // Cache for next load
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ logoUrl, faviconUrl }));
          } catch {
            // sessionStorage may be full or disabled
          }
        }
      } catch (err) {
        // Silently fail — fallback logo is already set
        console.warn('[BrandingContext] Failed to fetch branding:', err.message);
      }
    };

    fetchBranding();

    // Also set favicon from cache immediately
    updateFavicon(branding.faviconUrl);

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
};

/**
 * Hook to access branding (logoUrl, faviconUrl) from any component.
 * Falls back to static logo if context is not available.
 */
export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  return ctx || { logoUrl: FALLBACK_LOGO, faviconUrl: FALLBACK_LOGO };
};

export default BrandingContext;
