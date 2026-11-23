import { Suspense } from 'react';
import Link from 'next/link';
import { supabase, Wedding } from '@/lib/supabase';
import { BrandLogo } from '@/components/BrandLogo';
import { Footer } from '@/components/Footer';
import { Heart, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

async function WeddingsGrid() {
  const { data: weddings } = await supabase
    .from('weddings')
    .select('*')
    .order('wedding_date', { ascending: true });

  if (!weddings || weddings.length === 0) {
    return (
      <div className="rounded-3xl border border-[#E8DFD3] bg-white p-12 text-center">
        <Heart className="mx-auto h-10 w-10 text-[#B8925A]/50 mb-3" />
        <p className="font-serif text-2xl font-semibold">No Active Celebrations Yet</p>
        <p className="mt-2 text-sm text-[#7A6F67]">
          Sign in to the Couple &amp; Admin Studio to create your first wedding experience.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(weddings as Wedding[]).map((wedding) => (
        <Link
          key={wedding.id}
          href={`/${wedding.slug}`}
          className="group rounded-3xl bg-white border border-[#E8DFD3] overflow-hidden shadow-sm hover:shadow-md transition"
        >
          <div className="h-52 bg-[#EDE6DC] relative overflow-hidden">
            {wedding.hero_image_url ? (
              <img
                src={wedding.hero_image_url}
                alt={`${wedding.partner1_name} & ${wedding.partner2_name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-[#B8925A]/40" />
              </div>
            )}
          </div>
          <div className="p-6">
            <h2 className="font-serif text-2xl font-semibold">
              {wedding.partner1_name} &amp; {wedding.partner2_name}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-[#7A6F67]">
              <Calendar className="w-4 h-4 text-[#B8925A]" />
              {new Date(wedding.wedding_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#B8925A]">
              Enter Celebration <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function WeddingsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-80 rounded-3xl bg-white/70 border border-[#E8DFD3] animate-pulse" />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2520]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <BrandLogo size="md" />
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#2C2520] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#423831] transition"
          >
            <ShieldCheck className="w-4 h-4 text-[#B8925A]" />
            Couple &amp; Admin Studio
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B8925A]/15 px-4 py-1.5 text-xs font-medium text-[#9A7642] mb-4">
            <Heart className="w-3.5 h-3.5 fill-current" /> Digital Wedding Experiences
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-tight">
            Celebrate Love. Capture Every Unscripted Moment.
          </h1>
          <p className="mt-4 text-[#7A6F67] text-base sm:text-lg">
            Select an active wedding celebration below to view event details, share live wedding day
            photos, and sign the digital guestbook.
          </p>
        </div>

        {/* Streamed Active Weddings Grid */}
        <Suspense fallback={<WeddingsSkeleton />}>
          <WeddingsGrid />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}