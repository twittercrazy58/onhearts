import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { connection } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BrandLogo } from '@/components/BrandLogo';
import { WeddingInvitationClient } from '@/components/WeddingInvitationClient';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getCachedWeddingMetadata(slug: string) {
  'use cache';
  cacheLife('minutes');

  const { data: wedding } = await supabaseServer
    .from('weddings')
    .select('partner1_name, partner2_name, wedding_date, venue_name, hero_image_url')
    .eq('slug', slug)
    .maybeSingle();

  return wedding;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getCachedWeddingMetadata(slug);

  if (!wedding) {
    return {
      title: 'OneHearts | Powered by ProEdge Software Solutions',
      description: 'Digital Wedding Experience & Live Memories Platform',
    };
  }

  const coupleTitle = `${wedding.partner1_name} & ${wedding.partner2_name} — Wedding Invitation`;
  const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const description = `Join ${wedding.partner1_name} & ${wedding.partner2_name} on ${formattedDate} at ${wedding.venue_name}. Powered by OneHearts (ProEdge Software Solutions).`;

  return {
    title: coupleTitle,
    description,
    openGraph: {
      title: coupleTitle,
      description,
      images: wedding.hero_image_url ? [wedding.hero_image_url] : ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: coupleTitle,
      description,
      images: wedding.hero_image_url ? [wedding.hero_image_url] : ['/opengraph-image'],
    },
  };
}

async function DynamicMetadata() {
  await connection();
  return null;
}

function InvitationContentSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6 animate-pulse">
      <div className="h-3 w-40 mx-auto rounded-full bg-[#B8925A]/25" />
      <div className="h-14 w-3/4 mx-auto rounded-2xl bg-[#2C2520]/10" />
      <div className="h-4 w-1/2 mx-auto rounded-full bg-[#2C2520]/10" />
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white border border-[#E8DFD3]" />
        ))}
      </div>
    </div>
  );
}

export default function WeddingInvitationPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2520]">
      {/* Static Shell Header — Paints Immediately */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b border-[#E8DFD3] bg-[#FAF8F5]/90">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <BrandLogo variant="dark" size="sm" />
          <div className="hidden sm:flex gap-6 text-sm font-medium text-[#2C2520]">
            <a href="#story" className="hover:opacity-70">Our Story</a>
            <a href="#schedule" className="hover:opacity-70">Schedule</a>
            <a href="#guestbook" className="hover:opacity-70">Guestbook</a>
          </div>
          <a
            href="#guestbook"
            className="rounded-full bg-[#B8925A] px-4 py-2 text-xs font-semibold text-white"
          >
            Send Wishes
          </a>
        </div>
      </header>

      {/* Dynamic Couple Experience Streams In */}
      <Suspense fallback={<InvitationContentSkeleton />}>
        <DynamicMetadata />
        <WeddingInvitationClient />
      </Suspense>
    </div>
  );
}