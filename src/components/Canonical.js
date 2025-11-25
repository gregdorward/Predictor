// Canonical.js (KEEP THIS VERSION)
import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async'; // Internal Provider
import { useLocation } from 'react-router-dom';

const Canonical = () => {
  const location = useLocation();
  // 🔑 This line is the stable fix for your environment: it removes the slash.
  const pathname = location.pathname.replace(/\/+$/, '');
  const canonicalUrl = `https://www.soccerstatshub.com${pathname === '' ? '/' : pathname}`;

  return (
    <HelmetProvider>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
    </HelmetProvider>
  );
};

export default Canonical;