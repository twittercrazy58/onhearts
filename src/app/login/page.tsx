'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BrandLogo } from '@/components/BrandLogo';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        setError(authError?.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      // Check if user is a Platform Super-Admin
      const { data: adminRecord } = await supabase
        .from('platform_admins')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      router.refresh();
      if (adminRecord) {
        router.push('/admin');
      } else {
        router.push('/couple/studio');
      }

      // Safety fallback in case navigation is interrupted or cached
      setTimeout(() => setLoading(false), 4000);
    } catch {
      setError('Unable to reach authentication server. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] px-4 text-[#2C2520]">
      <div className="w-full max-w-md rounded-3xl bg-white border border-[#E8DFD3] p-8 shadow-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo size="lg" centered />
        </div>

        <h1 className="font-serif text-2xl font-semibold text-center mb-2">
          Wedding Studio Sign In
        </h1>
        <p className="text-center text-xs text-[#7A6F67] mb-6">
          Configure weddings, customize themes, and moderate guest memories.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#E8DFD3] px-4 py-3 text-sm"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#E8DFD3] px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#B8925A] py-3.5 text-sm font-semibold text-white hover:bg-[#A37F49] active:scale-[0.99] transition disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Enter OneHearts Studio'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}