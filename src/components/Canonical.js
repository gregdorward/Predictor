import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Canonical = () => {
  const location = useLocation();
  // Remove trailing slashes to match your sitemap preference
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