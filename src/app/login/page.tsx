'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BrandLogo } from '@/components/BrandLogo';
import { ArrowLeft, Loader2, Mail, MessageCircle, Sparkles } from 'lucide-react';

// Update these with your official OneHearts / ProEdge contact details
const CONTACT_WHATSAPP_NUMBER = '2349023176326'; // International format without '+'
const CONTACT_EMAIL = 'proedgesoftwaresolutions@gmail.com';

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

  const whatsappUrl = `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hello OneHearts! We would love to reserve a wedding space and feature our celebration on the platform.'
  )}`;

  const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    'Feature Our Wedding on OneHearts'
  )}&body=${encodeURIComponent(
    'Hello OneHearts Team,\n\nWe are planning our wedding and would love to get our own custom invitation page, live photo gallery, and table QR card.\n\nCouple Names:\nWedding Date:\nVenue/City:\n'
  )}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] px-4 py-10 text-[#2C2520]">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7A6F67] hover:text-[#2C2520] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        <div className="rounded-3xl bg-white border border-[#E8DFD3] p-8 shadow-sm">
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

          {/* New Couple / Event Planner Onboarding CTA */}
          <div className="mt-7 pt-6 border-t border-[#E8DFD3] text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#B8925A]">
              <Sparkles className="w-3.5 h-3.5" /> Planning a Wedding?
            </div>
            <h2 className="font-serif text-lg font-semibold mt-1">
              Want to Feature Your Wedding on OneHearts?
            </h2>
            <p className="text-xs text-[#7A6F67] mt-1 leading-relaxed">
              Get your custom digital invitation, live guest camera, table QR cards, and
              keepsake archive set up for your big day.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#2C2520] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#443A33] transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Book via WhatsApp
              </a>
              <a
                href={mailtoUrl}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E8DFD3] bg-[#FAF8F5] px-4 py-2.5 text-xs font-semibold text-[#2C2520] hover:bg-[#F2ECE3] transition"
              >
                <Mail className="w-3.5 h-3.5 text-[#B8925A]" /> Request Space
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}