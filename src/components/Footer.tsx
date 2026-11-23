'use client';

import { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';

export function Footer({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-current/10 py-12 px-4 text-center">
      <BrandLogo variant={variant} size="md" showSubtext centered />
      <p className="mt-4 text-xs opacity-60">
        &copy; {year} OneHearts. All memories preserved with love.
      </p>
    </footer>
  );
}