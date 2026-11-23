import { useCallback, useEffect, useState } from 'react';
import type { AdminUser } from './types/wedding';
import { BrandLogo } from './components/BrandLogo';

export default function App() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname || '/');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);

  const navigate = useCallback((nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setPathname(nextPath);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAdminRoute) return;
    setCheckingAuth(true);
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          setAdminUser(null);
          return;
        }
        const data = await res.json();
        setAdminUser(data.user || null);
      })
      .catch(() => setAdminUser(null))
      .finally(() => setCheckingAuth(false));
  }, [isAdminRoute]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAdminUser(null);
  };

  if (isAdminRoute) {
    if (checkingAuth) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-900">
          <BrandLogo />
          <p className="mt-5 text-sm text-slate-500">Verifying session...</p>
        </div>
      );
    }
    );
  }

  const slugMatch = pathname.match(/^\/w\/([^/]+)\/?$/);
  const slug = slugMatch ? decodeURIComponent(slugMatch[1]) : undefined;
}
