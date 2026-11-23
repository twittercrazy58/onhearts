'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { supabase, Wedding, GuestWish } from '@/lib/supabase';
import { THEME_PRESETS, getWeddingBrandColor } from '@/lib/themes';
import { getWeddingCopy } from '@/lib/copyPresets';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Footer } from '@/components/Footer';
import { useFeedback } from '@/components/FeedbackProvider';
import {
  Camera,
  MapPin,
  Send,
  Sparkles,
  X,
  ArrowRight,
  Loader2,
  UploadCloud,
  Images,
} from 'lucide-react';

export function WeddingInvitationClient() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const { notify } = useFeedback();

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [navigatingTarget, setNavigatingTarget] = useState<'upload' | 'gallery' | null>(null);

  // Guestbook Form State
  const [wishName, setWishName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [submittingWish, setSubmittingWish] = useState(false);

  useEffect(() => {
    setNavigatingTarget(null);
  }, [pathname]);

  useEffect(() => {
    if (!slug) return;

    async function loadWeddingData() {
      const { data: weddingData } = await supabase
        .from('weddings')
        .select('*')
        .eq('slug', slug)
        .single();

      if (weddingData) {
        setWedding(weddingData);
        const { data: wishData } = await supabase
          .from('guest_wishes')
          .select('*')
          .eq('wedding_id', weddingData.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        setWishes(wishData || []);
      }
      setLoading(false);
    }
    loadWeddingData();
  }, [slug]);

  if (loading) {
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

  if (!wedding) {
    return (
      <div className="p-16 text-center">
        <p className="font-serif text-2xl font-semibold">Wedding celebration not found.</p>
        <p className="text-sm text-[#7A6F67] mt-2">
          Please double-check the invitation link shared by the couple.
        </p>
      </div>
    );
  }

  const theme = THEME_PRESETS[wedding.theme_preset] || THEME_PRESETS.champagne;
  const isDark = wedding.theme_preset === 'midnight';
  const brandColor = getWeddingBrandColor(wedding);
  const copy = getWeddingCopy(wedding);

  // Featured small spotlight portraits shown above the Love Story
  const allPortraits = wedding.pre_wedding_photos || [];
  const spotlightPhotos = allPortraits.slice(0, 3);

  function goToMemories(section: 'upload' | 'gallery') {
    if (navigatingTarget || !wedding) return;
    setNavigatingTarget(section);
    router.push(`/${wedding.slug}/memories#${section}`);
    setTimeout(() => setNavigatingTarget(null), 4000);
  }

  async function handleWishSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wedding || submittingWish) return;
    setSubmittingWish(true);

    try {
      const { data: inserted, error: wishErr } = await supabase
        .from('guest_wishes')
        .insert({
          wedding_id: wedding.id,
          guest_name: wishName,
          relationship,
          message: wishMessage,
        })
        .select()
        .single();

      if (wishErr) {
        notify({
          title: 'Could not post wish',
          description: wishErr.message,
          variant: 'error',
        });
      } else if (inserted) {
        setWishes((prev) => [inserted, ...prev]);
        setWishName('');
        setRelationship('');
        setWishMessage('');
        notify({
          title: 'Guestbook signed!',
          description: 'Your congratulatory wish has been added to the celebration.',
          variant: 'success',
        });
      }
    } finally {
      setSubmittingWish(false);
    }
  }

  return (
    <div className={`relative z-30 -mt-[57px] min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Themed Sticky Navbar */}
      <nav className={`sticky top-0 z-30 backdrop-blur-md border-b ${theme.border} bg-opacity-90`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <BrandLogo variant={isDark ? 'light' : 'dark'} size="sm" />
          <div className="hidden sm:flex gap-6 text-sm font-medium">
            <a href="#story" className="hover:opacity-70">
              {copy.navStory}
            </a>
            {allPortraits.length > 0 && (
              <a href="#pre-wedding" className="hover:opacity-70">
                {copy.navGallery}
              </a>
            )}
            <a href="#schedule" className="hover:opacity-70">
              {copy.navSchedule}
            </a>
            <a href="#guestbook" className="hover:opacity-70">
              {copy.navGuestbook}
            </a>
          </div>
          <button
            type="button"
            onClick={() => goToMemories('gallery')}
            disabled={navigatingTarget !== null}
            style={{ backgroundColor: brandColor }}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white hover:opacity-90 active:scale-[0.98] transition shadow-sm disabled:opacity-75"
          >
            {navigatingTarget === 'gallery' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening...
              </>
            ) : (
              <>
                <Images className="w-3.5 h-3.5" /> View Live Gallery
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-16 sm:py-24 px-4 text-center overflow-hidden">
        {wedding.hero_image_url && (
          <div className="absolute inset-0 z-0">
            <img
              src={wedding.hero_image_url}
              alt="Couple Cover"
              className="w-full h-full object-cover opacity-25"
            />
          </div>
        )}
        <div className="relative z-10 max-w-3xl mx-auto">
          <p
            style={{ color: brandColor }}
            className="uppercase tracking-[0.25em] text-xs font-semibold"
          >
            {copy.heroEyebrow}
          </p>
          <h1 className="font-serif text-5xl sm:text-7xl font-semibold mt-4">
            {wedding.partner1_name} &amp; {wedding.partner2_name}
          </h1>
          <p className={`mt-4 text-base sm:text-lg ${theme.muted}`}>
            {new Date(wedding.wedding_date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            &bull; {wedding.venue_name}
          </p>

          <CountdownTimer targetDate={wedding.wedding_date} />

          {/* Primary Above-The-Fold Guest Photo Upload CTA */}
          <div className="mt-8 flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={() => goToMemories('upload')}
              disabled={navigatingTarget !== null}
              style={{ backgroundColor: brandColor }}
              className="inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-sm sm:text-base font-semibold text-white shadow-lg hover:opacity-95 active:scale-[0.98] transition disabled:opacity-75"
            >
              {navigatingTarget === 'upload' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading Photo Uploader...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" /> Upload &amp; View Wedding Photos
                </>
              )}
            </button>
            <p className={`text-xs ${theme.muted}`}>
              Snapped a picture on your phone? Tap above to add it to our live gallery—no app needed.
            </p>
          </div>
        </div>
      </header>

      {/* Featured Couple & Solo Spotlight Strip (Compact Editorial Frames) */}
      {spotlightPhotos.length > 0 && (
        <section aria-label="Couple Spotlight" className="max-w-3xl mx-auto px-4 pt-10 pb-2">
          <div
            className={`grid gap-3 sm:gap-5 items-center ${
              spotlightPhotos.length === 1
                ? 'grid-cols-1 max-w-xs mx-auto'
                : spotlightPhotos.length === 2
                  ? 'grid-cols-2 max-w-lg mx-auto'
                  : 'grid-cols-3'
            }`}
          >
            {spotlightPhotos.map((url, idx) => {
              const isCenterCard = spotlightPhotos.length === 3 && idx === 1;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxUrl(url)}
                  style={{ borderColor: `${brandColor}45` }}
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 shadow-sm cursor-pointer transition duration-500 ${
                    isCenterCard ? 'sm:-translate-y-3 shadow-md' : ''
                  }`}
                >
                  <img
                    src={url}
                    alt={`${wedding.partner1_name} & ${wedding.partner2_name} featured portrait ${idx + 1}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Love Story */}
      <section id="story" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Sparkles style={{ color: brandColor }} className="w-6 h-6 mx-auto mb-3" />
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold">{copy.storyTitle}</h2>
        <p className={`mt-4 leading-relaxed text-base sm:text-lg ${theme.muted}`}>
          {wedding.love_story || copy.storyFallback}
        </p>
      </section>

      {/* Full Pre-Wedding Shoot Gallery */}
      {allPortraits.length > 0 && (
        <section id="pre-wedding" className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <p
              style={{ color: brandColor }}
              className="uppercase tracking-[0.22em] text-xs font-semibold"
            >
              {copy.galleryEyebrow}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold mt-2">
              {copy.galleryTitle}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPortraits.map((url, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxUrl(url)}
                className={`group relative aspect-[4/5] rounded-2xl overflow-hidden border ${theme.border} cursor-pointer shadow-sm`}
              >
                <img
                  src={url}
                  alt={`${wedding.partner1_name} & ${wedding.partner2_name} pre-wedding portrait ${idx + 1}`}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Wedding Day Schedule */}
      <section id="schedule" className="max-w-4xl mx-auto px-4 py-16 text-left">
        <h3 className="font-serif text-3xl font-semibold text-center mb-8">
          {copy.scheduleTitle}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {(wedding.schedule || []).map((item, idx) => (
            <div key={idx} className={`rounded-2xl p-6 border ${theme.border} ${theme.surface}`}>
              <span
                style={{ color: brandColor }}
                className="text-xs font-bold uppercase tracking-wider"
              >
                {item.time}
              </span>
              <h4 className="font-serif text-xl font-semibold mt-1">{item.title}</h4>
              <p className={`text-xs flex items-center gap-1 mt-1 ${theme.muted}`}>
                <MapPin style={{ color: brandColor }} className="w-3.5 h-3.5" /> {item.location}
              </p>
              <p className={`text-sm mt-2 ${theme.muted}`}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Callout Banner to Dedicated Guest Photos & Live Gallery Page */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div
          style={{ borderColor: `${brandColor}50` }}
          className={`rounded-3xl p-8 sm:p-10 border-2 ${theme.surface} flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md`}
        >
          <div className="text-center sm:text-left">
            <p
              style={{ color: brandColor }}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Live Wedding Camera &amp; Gallery
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold mt-1">
              Got Wedding Photos on Your Phone?
            </h3>
            <p className={`text-sm mt-1.5 max-w-md ${theme.muted}`}>
              Tap the button to upload your pictures directly to our wedding album and see what
              other guests have posted.
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToMemories('upload')}
            disabled={navigatingTarget !== null}
            style={{ backgroundColor: brandColor }}
            className="shrink-0 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition shadow-sm disabled:opacity-75"
          >
            {navigatingTarget === 'upload' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Opening...
              </>
            ) : (
              <>
                Upload &amp; Browse Photos <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Digital Guestbook & Best Wishes */}
      <section id="guestbook" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-center mb-8">
          {copy.guestbookTitle}
        </h2>
        <form
          onSubmit={handleWishSubmit}
          className={`rounded-3xl p-6 border ${theme.border} ${theme.surface} mb-10 space-y-4`}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder={copy.wishNamePlaceholder}
              value={wishName}
              onChange={(e) => setWishName(e.target.value)}
              className={`rounded-xl border ${theme.border} bg-transparent px-4 py-3 text-sm`}
            />
            <input
              type="text"
              placeholder={copy.wishRelationPlaceholder}
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className={`rounded-xl border ${theme.border} bg-transparent px-4 py-3 text-sm`}
            />
          </div>
          <textarea
            required
            rows={3}
            placeholder={copy.wishMessagePlaceholder}
            value={wishMessage}
            onChange={(e) => setWishMessage(e.target.value)}
            className={`w-full rounded-xl border ${theme.border} bg-transparent px-4 py-3 text-sm`}
          />
          <button
            type="submit"
            disabled={submittingWish}
            style={{ backgroundColor: brandColor }}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition shadow-sm disabled:opacity-75"
          >
            {submittingWish ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Posting Wish...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> {copy.wishSubmitLabel}
              </>
            )}
          </button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2">
          {wishes.map((wish) => (
            <div key={wish.id} className={`rounded-2xl p-6 border ${theme.border} ${theme.surface}`}>
              <p className="italic text-sm leading-relaxed">&ldquo;{wish.message}&rdquo;</p>
              <div className="mt-4 pt-3 border-t border-current/10 flex justify-between text-xs">
                <span className="font-semibold">{wish.guest_name}</span>
                <span style={{ color: brandColor }} className="font-medium">
                  {wish.relationship}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating View Live Gallery Action Pill -> Scrolls Straight to #gallery */}
      <button
        type="button"
        onClick={() => goToMemories('gallery')}
        disabled={navigatingTarget !== null}
        style={{ backgroundColor: brandColor }}
        aria-label="View live wedding gallery"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xl hover:opacity-95 active:scale-95 transition disabled:opacity-80"
      >
        {navigatingTarget === 'gallery' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Opening Gallery...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" /> View Live Gallery
          </>
        )}
      </button>

      {/* Pre-Wedding Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 text-white"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxUrl}
            alt="Pre-wedding memory"
            className="max-h-[85vh] max-w-full rounded-xl"
          />
        </div>
      )}

      <Footer variant={isDark ? 'light' : 'dark'} />
    </div>
  );
}