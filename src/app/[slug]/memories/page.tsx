'use client';

import { upload } from '@upstash/blob/browser';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { supabase, Wedding, GuestPhoto } from '@/lib/supabase';
import { THEME_PRESETS, getWeddingBrandColor } from '@/lib/themes';
import { BrandLogo } from '@/components/BrandLogo';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Footer } from '@/components/Footer';
import { useFeedback } from '@/components/FeedbackProvider';
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Lock,
  RefreshCw,
  UploadCloud,
  X,
} from 'lucide-react';

const MEMORIES_INTRO_PROMPTS = [
  'Took photos or videos of the couple and guests today? Tap below to upload them straight into our live wedding album—no app download needed.',
  'Share the wedding moments you snapped on your phone! Upload photos or short video clips below so the couple and everyone here can see them live.',
  'Help us collect every moment from today. Enter your name below, select your photos or short videos from your phone gallery, and tap upload to add them to our wedding gallery.',
];

function WeddingMemoriesContent() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const { notify } = useFeedback();

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingGallery, setRefreshingGallery] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isUploadLocked, setIsUploadLocked] = useState(false);
  const [introPromptIndex, setIntroPromptIndex] = useState(0);
  const [navigatingBack, setNavigatingBack] = useState(false);

  // Upload Form State
  const [guestName, setGuestName] = useState('');
  const [caption, setCaption] = useState('');
  const [momentTag, setMomentTag] = useState('Reception');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  // Refs for back-button guard & touch swipe
  const lightboxOpenRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    lightboxOpenRef.current = lightboxIndex !== null;
  }, [lightboxIndex]);

  useEffect(() => {
    setNavigatingBack(false);
  }, [pathname]);

  useEffect(() => {
    const storageKey = 'onehearts_memories_prompt_idx';
    const previous = Number(window.localStorage.getItem(storageKey) ?? -1);
    const next = (previous + 1) % MEMORIES_INTRO_PROMPTS.length;
    window.localStorage.setItem(storageKey, String(next));
    setIntroPromptIndex(next);
  }, []);

  const fetchApprovedPhotos = useCallback(async (weddingId: string) => {
    const { data: photoData } = await supabase
      .from('guest_photos')
      .select('*')
      .eq('wedding_id', weddingId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    setPhotos(photoData || []);
  }, []);

  useEffect(() => {
    if (!slug) return;

    async function loadMemories() {
      const { data: weddingData } = await supabase
        .from('weddings')
        .select('*')
        .eq('slug', slug)
        .single();

      if (weddingData) {
        setWedding(weddingData);

        const exactWeddingTime = new Date(weddingData.wedding_date).getTime();
        setIsUploadLocked(
          Boolean(weddingData.restrict_uploads_until_wedding_day) &&
            !isNaN(exactWeddingTime) &&
            Date.now() < exactWeddingTime
        );

        await fetchApprovedPhotos(weddingData.id);
      }
      setLoading(false);
    }
    loadMemories();
  }, [slug, fetchApprovedPhotos]);

  // Smoothly scroll to #gallery when arriving from "View Live Gallery"
  useEffect(() => {
    if (!loading && window.location.hash === '#gallery') {
      const galleryEl = document.getElementById('gallery');
      if (galleryEl) {
        galleryEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [loading]);

  const filteredPhotos =
    activeTag === 'All' ? photos : photos.filter((p) => p.moment_tag === activeTag);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    if (typeof window !== 'undefined' && !window.history.state?.oneheartsMemoriesLightbox) {
      window.history.pushState({ ...window.history.state, oneheartsMemoriesLightbox: true }, '');
    }
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    if (typeof window !== 'undefined' && window.history.state?.oneheartsMemoriesLightbox) {
      window.history.back();
    }
  }, []);

  const showPrevPhoto = useCallback(() => {
    if (filteredPhotos.length === 0) return;
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
    );
  }, [filteredPhotos.length]);

  const showNextPhoto = useCallback(() => {
    if (filteredPhotos.length === 0) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredPhotos.length));
  }, [filteredPhotos.length]);

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') showPrevPhoto();
      if (e.key === 'ArrowRight') showNextPhoto();
      if (e.key === 'Escape') closeLightbox();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, showPrevPhoto, showNextPhoto, closeLightbox]);

  // Device Back button: close lightbox first, or route safely back to the wedding invitation
  useEffect(() => {
    if (typeof window === 'undefined' || !wedding) return;

    window.history.replaceState({ ...window.history.state, oneheartsMemoriesBase: true }, '');
    window.history.pushState({ ...window.history.state, oneheartsMemoriesGuard: true }, '');

    function handlePopState() {
      if (lightboxOpenRef.current) {
        setLightboxIndex(null);
        return;
      }

      // Route back to the wedding invitation instead of leaving the site
      router.push(`/${wedding!.slug}`);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [wedding, router]);

  if (loading) return <LoadingScreen />;
  if (!wedding) return <div className="p-12 text-center">Wedding celebration not found.</div>;

  const theme = THEME_PRESETS[wedding.theme_preset] || THEME_PRESETS.champagne;
  const isDark = wedding.theme_preset === 'midnight';
  const brandColor = getWeddingBrandColor(wedding);

  const activeLightboxPhoto =
    lightboxIndex !== null && filteredPhotos[lightboxIndex] ? filteredPhotos[lightboxIndex] : null;

  async function handleRefreshGallery() {
    if (!wedding || refreshingGallery) return;
    setRefreshingGallery(true);
    try {
      await fetchApprovedPhotos(wedding.id);
      notify({
        title: 'Gallery updated',
        description: 'Fetched the latest shared memories.',
        variant: 'info',
      });
    } finally {
      setRefreshingGallery(false);
    }
  }

  async function handlePhotoUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isUploadLocked || uploading) return;
    if (!files || files.length === 0 || !wedding) return;
    setUploading(true);

    const formEl = e.currentTarget;
    let uploadedCount = 0;

    try {
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith('video/');
        let finalPublicUrl = '';

        if (isVideo) {
  if (file.size > 25 * 1024 * 1024) {
    notify({
      title: 'Video too large',
      description: `${file.name} exceeds 25 MB. Please trim it to a shorter clip.`,
      variant: 'error',
    });
    continue;
  }

  try {
    const task = upload(file, {
      route: '/api/upload-video',
      input: { weddingId: wedding.id },
    });
    const blob = await task.done;
    finalPublicUrl = blob.url;
  } catch (err) {
    notify({
      title: 'Video upload error',
      description: err instanceof Error ? err.message : 'Could not upload video.',
      variant: 'error',
    });
    continue;
            }
      } else {
          const compressed = await imageCompression(file, {
            maxSizeMB: 0.35,
            maxWidthOrHeight: 1440,
            initialQuality: 0.8,
            useWebWorker: true,
          });
          const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
          const filePath = `${wedding.id}/${Date.now()}-${cleanName}`;

          const { error: uploadErr } = await supabase.storage
            .from('wedding-memories')
            .upload(filePath, compressed, {
              contentType: compressed.type || 'image/jpeg',
              upsert: false,
            });

          if (uploadErr) {
            notify({
              title: 'Storage upload error',
              description: uploadErr.message,
              variant: 'error',
            });
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from('wedding-memories')
            .getPublicUrl(filePath);
          finalPublicUrl = publicUrlData.publicUrl;
        }

        const { data: inserted, error: insertErr } = await supabase
          .from('guest_photos')
          .insert({
            wedding_id: wedding.id,
            guest_name: guestName,
            caption,
            moment_tag: momentTag,
            image_url: finalPublicUrl,
            media_type: isVideo ? 'video' : 'image',
            is_approved: !wedding.require_photo_approval,
          })
          .select()
          .single();

        if (insertErr) {
          notify({
            title: 'Database save error',
            description: insertErr.message,
            variant: 'error',
          });
          continue;
        }

        if (inserted) {
          uploadedCount++;
          if (!wedding.require_photo_approval) {
            setPhotos((prev) => [inserted, ...prev]);
          }
        }
      }

      if (uploadedCount > 0) {
        notify({
          title: wedding.require_photo_approval ? 'Submitted for review!' : 'Memories are live!',
          description: wedding.require_photo_approval
            ? `${uploadedCount} item(s) will appear once approved by the couple.`
            : `${uploadedCount} item(s) uploaded to the live gallery.`,
          variant: 'success',
        });
        setCaption('');
        setFiles(null);
        formEl.reset();
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleLike(photo: GuestPhoto) {
    const updatedCount = photo.likes_count + 1;
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, likes_count: updatedCount } : p))
    );
    await supabase.from('guest_photos').update({ likes_count: updatedCount }).eq('id', photo.id);
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg} ${theme.text}`}>
      {/* Sticky Top Navbar */}
      <nav className={`sticky top-0 z-30 backdrop-blur-md border-b ${theme.border} bg-opacity-90`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <BrandLogo variant={isDark ? 'light' : 'dark'} size="sm" />
          <button
            type="button"
            disabled={navigatingBack}
            onClick={() => {
              setNavigatingBack(true);
              router.push(`/${wedding.slug}`);
              setTimeout(() => setNavigatingBack(false), 4000);
            }}
            style={{ borderColor: brandColor, color: brandColor }}
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold hover:opacity-80 active:scale-[0.98] transition disabled:opacity-70"
          >
            {navigatingBack ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Returning...
              </>
            ) : (
              <>
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Invitation
              </>
            )}
          </button>
        </div>
      </nav>

      <main className="flex-1">
        {/* Page Header */}
        <header className="max-w-4xl mx-auto px-4 pt-12 pb-6 text-center">
          <p
            style={{ color: brandColor }}
            className="uppercase tracking-[0.22em] text-xs font-semibold"
          >
            {wedding.partner1_name} &amp; {wedding.partner2_name}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mt-2">
            Wedding Memories &amp; Live Gallery
          </h1>
          <p className={`mt-3 text-sm sm:text-base max-w-xl mx-auto ${theme.muted}`}>
            {MEMORIES_INTRO_PROMPTS[introPromptIndex]}
          </p>
        </header>

        {/* Guest Photo & Video Upload Section */}
        <section id="upload" className="max-w-2xl mx-auto px-4 py-8">
          {isUploadLocked ? (
            <div
              className={`rounded-3xl p-8 sm:p-10 border ${theme.border} ${theme.surface} text-center shadow-sm`}
            >
              <div
                style={{ backgroundColor: `${brandColor}1A` }}
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              >
                <Lock style={{ color: brandColor }} className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
                Live Camera Opens at Ceremony Time
              </h2>
              <p className={`mt-3 text-sm sm:text-base max-w-md mx-auto ${theme.muted}`}>
                Guest uploads are currently locked until{' '}
                <span className="font-semibold">
                  {new Date(wedding.wedding_date).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                . Come back when the celebration begins to capture and share every moment!
              </p>
            </div>
          ) : (
            <form
              onSubmit={handlePhotoUpload}
              className={`rounded-3xl p-6 sm:p-8 border ${theme.border} ${theme.surface} shadow-sm`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Camera style={{ color: brandColor }} className="w-6 h-6" />
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
                  Upload Photos &amp; Videos
                </h2>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Step 1: Enter Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={`w-full rounded-xl border ${theme.border} bg-transparent px-4 py-3 text-sm`}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <select
                    value={momentTag}
                    onChange={(e) => setMomentTag(e.target.value)}
                    className={`w-full rounded-xl border ${theme.border} bg-transparent px-4 py-3 text-sm`}
                  >
                    <option value="Ceremony">Ceremony</option>
                    <option value="Reception">Reception</option>
                    <option value="First Dance">First Dance</option>
                    <option value="Candid & Party">Candid &amp; Party</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Short caption (optional)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className={`w-full rounded-xl border ${theme.border} bg-transparent px-4 py-3 text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 opacity-80">
                    Step 2: Choose photos or short video clips (max 25 MB per video)
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/quicktime,video/webm"
                    multiple
                    required
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-black/5 file:px-4 file:py-2 file:text-xs file:font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{ backgroundColor: brandColor }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.99] transition shadow-sm disabled:opacity-75"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading Memories...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Step 3: Upload to Wedding Gallery
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Live Photo & Video Gallery */}
        <section id="gallery" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-20">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold">
                Shared Moments ({filteredPhotos.length})
              </h2>
              <button
                type="button"
                onClick={handleRefreshGallery}
                disabled={refreshingGallery}
                style={{ borderColor: `${brandColor}60`, color: brandColor }}
                aria-label="Refresh gallery memories"
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold hover:opacity-80 active:scale-95 transition disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshingGallery ? 'animate-spin' : ''}`}
                />
                {refreshingGallery ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {['All', 'Ceremony', 'Reception', 'First Dance', 'Candid & Party'].map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setActiveTag(tag);
                      setLightboxIndex(null);
                    }}
                    style={
                      isActive
                        ? { backgroundColor: brandColor, borderColor: brandColor, color: '#FFFFFF' }
                        : undefined
                    }
                    className={`rounded-full px-4 py-1.5 text-xs font-medium border transition ${
                      isActive ? 'shadow-sm' : theme.border
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredPhotos.length === 0 ? (
            <div className={`rounded-3xl border ${theme.border} ${theme.surface} p-12 text-center`}>
              <Camera style={{ color: brandColor }} className="w-8 h-8 mx-auto mb-3 opacity-60" />
              <p className="font-serif text-xl font-semibold">No Memories Shared Yet</p>
              <p className={`text-xs mt-1 ${theme.muted}`}>
                {isUploadLocked
                  ? 'Photos and videos uploaded by guests when the celebration begins will appear right here.'
                  : 'Be the first to capture and share a moment from the celebration!'}
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className={`break-inside-avoid rounded-2xl overflow-hidden border ${theme.border} ${theme.surface}`}
                >
                  {photo.media_type === 'video' ? (
                    <video
                      src={photo.image_url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[460px] bg-black object-contain"
                    />
                  ) : (
                    <img
                      src={photo.image_url}
                      alt={photo.caption || 'Wedding memory'}
                      onClick={() => openLightbox(idx)}
                      className="w-full cursor-pointer hover:opacity-95 transition"
                    />
                  )}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{photo.guest_name}</p>
                        <span
                          style={{ color: brandColor }}
                          className="text-[10px] font-semibold uppercase tracking-wider"
                        >
                          &bull; {photo.moment_tag}
                        </span>
                      </div>
                      {photo.caption && <p className={`text-xs ${theme.muted}`}>{photo.caption}</p>}
                    </div>
                    <button
                      onClick={() => handleLike(photo)}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border border-current/15 hover:bg-rose-500/10 active:scale-95 transition"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      {photo.likes_count}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Fullscreen Lightbox Modal with Previous / Next Controls & Swipe */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex flex-col items-center justify-center p-4 select-none"
          onClick={closeLightbox}
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartXRef.current === null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
            const deltaX = endX - touchStartXRef.current;
            touchStartXRef.current = null;
            if (Math.abs(deltaX) > 45) {
              if (deltaX > 0) showPrevPhoto();
              else showNextPhoto();
            }
          }}
        >
          {/* Top Counter & Close Button */}
          <div
            className="absolute top-5 inset-x-5 flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="rounded-full bg-white/15 px-3.5 py-1 text-xs font-medium backdrop-blur-sm">
              {lightboxIndex + 1} / {filteredPhotos.length}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close memory preview"
              className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Previous Button */}
          {filteredPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrevPhoto();
              }}
              aria-label="Previous memory"
              className="absolute left-3 sm:left-6 z-10 rounded-full bg-white/15 p-3 text-white hover:bg-white/30 active:scale-95 transition backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}

          {/* Active Photo or Video */}
          {activeLightboxPhoto.media_type === 'video' ? (
            <video
              src={activeLightboxPhoto.image_url}
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
              className="max-h-[78vh] max-w-[85vw] rounded-xl bg-black shadow-2xl"
            />
          ) : (
            <img
              src={activeLightboxPhoto.image_url}
              alt={activeLightboxPhoto.caption || 'Full screen memory'}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[78vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            />
          )}

          {/* Attribution & Caption Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 max-w-md text-center text-white px-4"
          >
            <p className="text-sm font-semibold">
              {activeLightboxPhoto.guest_name}{' '}
              <span className="text-xs font-normal text-white/70">
                &bull; {activeLightboxPhoto.moment_tag}
              </span>
            </p>
            {activeLightboxPhoto.caption && (
              <p className="text-xs text-white/80 mt-1">{activeLightboxPhoto.caption}</p>
            )}
          </div>

          {/* Next Button */}
          {filteredPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNextPhoto();
              }}
              aria-label="Next memory"
              className="absolute right-3 sm:right-6 z-10 rounded-full bg-white/15 p-3 text-white hover:bg-white/30 active:scale-95 transition backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
        </div>
      )}

      <Footer variant={isDark ? 'light' : 'dark'} />
    </div>
  );
}

export default function WeddingMemoriesPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WeddingMemoriesContent />
    </Suspense>
  );
}