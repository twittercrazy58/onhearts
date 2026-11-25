'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import imageCompression from 'browser-image-compression';
import { supabase, Wedding, GuestPhoto, GuestWish, ScheduleItem } from '@/lib/supabase';
import { BrandLogo } from '@/components/BrandLogo';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Footer } from '@/components/Footer';
import { useFeedback } from '@/components/FeedbackProvider';
import { PrintableTableQrCard } from '@/components/PrintableTableQrCard';
import {
  Palette,
  Upload,
  Trash2,
  CheckCircle,
  ExternalLink,
  LogOut,
  Plus,
  Clock,
  Download,
  Printer,
  Copy,
  Check,
  QrCode,
  RefreshCw,
} from 'lucide-react';

const WEDDING_COLOR_SWATCHES = [
  { name: 'Champagne Gold', hex: '#B8925A' },
  { name: 'Emerald Green', hex: '#1B6B50' },
  { name: 'Royal Blue', hex: '#1E40AF' },
  { name: 'Burgundy Wine', hex: '#881337' },
  { name: 'Dusty Rose', hex: '#B56576' },
  { name: 'Terracotta', hex: '#C2593F' },
  { name: 'Royal Lilac', hex: '#7E57C2' },
];

function toLocalDateTimeInput(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function CoupleBackroomPage() {
  const router = useRouter();
  const { notify, confirm } = useFeedback();

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPreWedding, setUploadingPreWedding] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [origin, setOrigin] = useState('https://onehearts.app');

  const dirtyFieldsRef = useRef<Set<keyof Wedding>>(new Set());

  function updateField<K extends keyof Wedding>(field: K, value: Wedding[K]) {
    dirtyFieldsRef.current.add(field);
    setWedding((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function getDirtyOverrides(current: Wedding): Partial<Wedding> {
    const overrides: Partial<Wedding> = {};
    dirtyFieldsRef.current.forEach((key) => {
      (overrides as Record<string, unknown>)[key] = current[key];
    });
    return overrides;
  }

  const fetchLatestWedding = useCallback(async (weddingId: string): Promise<Wedding | null> => {
    const { data } = await supabase
      .from('weddings')
      .select('*')
      .eq('id', weddingId)
      .single();
    return (data as Wedding) || null;
  }, []);

  const syncWeddingData = useCallback(
    async (weddingId: string, showToast = false) => {
      setSyncing(true);
      try {
        const [latestWedding, { data: p }, { data: w }] = await Promise.all([
          fetchLatestWedding(weddingId),
          supabase
            .from('guest_photos')
            .select('*')
            .eq('wedding_id', weddingId)
            .order('created_at', { ascending: false }),
          supabase
            .from('guest_wishes')
            .select('*')
            .eq('wedding_id', weddingId)
            .order('created_at', { ascending: false }),
        ]);

        if (latestWedding) {
          dirtyFieldsRef.current.clear();
          setWedding(latestWedding);
        }
        setPhotos(p || []);
        setWishes(w || []);

        if (showToast) {
          notify({
            title: 'Synced with latest updates',
            description: 'Fetched the newest changes from the server.',
            variant: 'info',
          });
        }
      } finally {
        setSyncing(false);
      }
    },
    [fetchLatestWedding, notify]
  );

  useEffect(() => {
    setOrigin(window.location.origin);

    async function loadCoupleWedding() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        router.push('/login');
        return;
      }

      const cleanEmail = (user.email || '').trim();
      const { data: weddingData } = await supabase
        .from('weddings')
        .select('*')
        .or(`couple_user_id.eq.${user.id},couple_email.ilike.${cleanEmail}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (weddingData) {
        setWedding(weddingData);
        await syncWeddingData(weddingData.id, false);
      }
      setLoading(false);
    }
    loadCoupleWedding();
  }, [router, syncWeddingData]);

  // Realtime sync with Admin Studio & Live Guest Uploads
  useEffect(() => {
    if (!wedding?.id) return;
    const weddingId = wedding.id;

    const channel = supabase
      .channel(`couple-sync-${weddingId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'weddings', filter: `id=eq.${weddingId}` },
        (payload) => {
          const incoming = payload.new as Wedding;
          setWedding((current) => {
            if (!current || current.id !== incoming.id) return current;
           const merged: Wedding = { ...incoming };
            dirtyFieldsRef.current.forEach((key) => {
              (merged as unknown as Record<string, unknown>)[key] = current[key];
            });
            return merged;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guest_photos',
          filter: `wedding_id=eq.${weddingId}`,
        },
        async () => {
          const { data: p } = await supabase
            .from('guest_photos')
            .select('*')
            .eq('wedding_id', weddingId)
            .order('created_at', { ascending: false });
          setPhotos(p || []);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guest_wishes',
          filter: `wedding_id=eq.${weddingId}`,
        },
        async () => {
          const { data: w } = await supabase
            .from('guest_wishes')
            .select('*')
            .eq('wedding_id', weddingId)
            .order('created_at', { ascending: false });
          setWishes(w || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [wedding?.id]);

  async function handleCoverFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !wedding) return;

    setUploadingCover(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.9,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const filePath = `covers/${wedding.id}/${Date.now()}-${cleanName}`;

      const { error: uploadErr } = await supabase.storage
        .from('wedding-memories')
        .upload(filePath, compressed, { upsert: true });

      if (uploadErr) {
        notify({ title: 'Cover upload failed', description: uploadErr.message, variant: 'error' });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('wedding-memories')
        .getPublicUrl(filePath);

      const newUrl = publicUrlData.publicUrl;
      const { data: fresh } = await supabase
        .from('weddings')
        .update({ hero_image_url: newUrl })
        .eq('id', wedding.id)
        .select()
        .single();

      if (fresh) {
        dirtyFieldsRef.current.delete('hero_image_url');
        setWedding((prev) => (prev ? { ...fresh, ...getDirtyOverrides(prev) } : fresh));
      }
      notify({ title: 'Cover photo updated', variant: 'success' });
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  }

  async function handlePreWeddingUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !wedding) return;
    setUploadingPreWedding(true);

    try {
      const newUrls: string[] = [];
      for (const file of Array.from(fileList)) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.85,
          maxWidthOrHeight: 1800,
          useWebWorker: true,
        });
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const filePath = `pre-wedding/${wedding.id}/${Date.now()}-${cleanName}`;
        const { error } = await supabase.storage
          .from('wedding-memories')
          .upload(filePath, compressed, { upsert: true });

        if (!error) {
          const { data } = supabase.storage.from('wedding-memories').getPublicUrl(filePath);
          newUrls.push(data.publicUrl);
        }
      }

      if (newUrls.length > 0) {
        const latest = await fetchLatestWedding(wedding.id);
        const basePhotos = latest?.pre_wedding_photos || wedding.pre_wedding_photos || [];
        const merged = [...basePhotos, ...newUrls];

        const { data: updatedWedding } = await supabase
          .from('weddings')
          .update({ pre_wedding_photos: merged })
          .eq('id', wedding.id)
          .select()
          .single();

        if (updatedWedding) {
          setWedding((prev) =>
            prev ? { ...updatedWedding, ...getDirtyOverrides(prev) } : updatedWedding
          );
        }
        notify({
          title: `${newUrls.length} portrait(s) added`,
          description: 'Your Pre-Wedding Gallery has been updated.',
          variant: 'success',
        });
      }
    } finally {
      setUploadingPreWedding(false);
      e.target.value = '';
    }
  }

  async function handleRemovePreWeddingPhoto(urlToRemove: string) {
    if (!wedding) return;

    const latest = await fetchLatestWedding(wedding.id);
    const basePhotos = latest?.pre_wedding_photos || wedding.pre_wedding_photos || [];
    const filtered = basePhotos.filter((url) => url !== urlToRemove);

    const { data: updatedWedding } = await supabase
      .from('weddings')
      .update({ pre_wedding_photos: filtered })
      .eq('id', wedding.id)
      .select()
      .single();

    if (updatedWedding) {
      setWedding((prev) =>
        prev ? { ...updatedWedding, ...getDirtyOverrides(prev) } : updatedWedding
      );
    }
    notify({ title: 'Portrait removed', variant: 'info' });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!wedding) return;
    setSaving(true);

    try {
      const latest = await fetchLatestWedding(wedding.id);

      const patch: Partial<Wedding> = {};
      if (dirtyFieldsRef.current.size > 0) {
        dirtyFieldsRef.current.forEach((field) => {
          (patch as Record<string, unknown>)[field] = wedding[field];
        });
      } else {
        Object.assign(patch, {
          partner1_name: wedding.partner1_name,
          partner2_name: wedding.partner2_name,
          wedding_date: wedding.wedding_date,
          venue_name: wedding.venue_name,
          love_story: wedding.love_story,
          theme_preset: wedding.theme_preset,
          custom_primary_color: wedding.custom_primary_color,
          schedule: wedding.schedule,
          require_photo_approval: wedding.require_photo_approval,
          restrict_uploads_until_wedding_day: wedding.restrict_uploads_until_wedding_day,
        });
      }

      const { data: savedRow, error } = await supabase
        .from('weddings')
        .update(patch)
        .eq('id', wedding.id)
        .select()
        .single();

      if (error) {
        notify({ title: 'Save failed', description: error.message, variant: 'error' });
      } else {
        const finalWedding = savedRow || (latest ? { ...latest, ...patch } : wedding);
        dirtyFieldsRef.current.clear();
        setWedding(finalWedding);
        notify({
          title: 'Wedding page published!',
          description: 'Your color code, schedule, and details are now live for guests.',
          variant: 'success',
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePhotoApproval(photo: GuestPhoto) {
    const updated = !photo.is_approved;
    await supabase.from('guest_photos').update({ is_approved: updated }).eq('id', photo.id);
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, is_approved: updated } : p)));
    notify({
      title: updated ? 'Photo approved and live' : 'Photo hidden from public gallery',
      variant: 'info',
    });
  }

  async function deletePhoto(id: string) {
    const approved = await confirm({
      title: 'Remove Guest Photo?',
      description: 'This photo will be permanently deleted from your wedding gallery.',
      confirmLabel: 'Remove Photo',
      destructive: true,
    });
    if (!approved) return;

    await supabase.from('guest_photos').delete().eq('id', id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    notify({ title: 'Guest photo deleted', variant: 'info' });
  }

  async function deleteWish(id: string) {
    const approved = await confirm({
      title: 'Delete Guestbook Wish?',
      description: 'This message will be removed from your digital guestbook.',
      confirmLabel: 'Delete Wish',
      destructive: true,
    });
    if (!approved) return;

    await supabase.from('guest_wishes').delete().eq('id', id);
    setWishes((prev) => prev.filter((w) => w.id !== id));
    notify({ title: 'Guestbook wish removed', variant: 'info' });
  }

  async function handleDownloadAllZip() {
    if (!wedding || photos.length === 0) return;
    setZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(`${wedding.slug}-memories`) || zip;

      await Promise.all(
        photos.map(async (photo, idx) => {
          try {
            const response = await fetch(photo.image_url);
            const blob = await response.blob();
            const extension = blob.type.includes('png') ? 'png' : 'jpg';
            const safeGuest = photo.guest_name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Guest';
            const safeTag = photo.moment_tag.replace(/[^a-zA-Z0-9_-]/g, '_');
            folder.file(`${String(idx + 1).padStart(3, '0')}_${safeTag}_${safeGuest}.${extension}`, blob);
          } catch (err) {
            console.error('Failed to bundle image:', photo.image_url, err);
          }
        })
      );

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `OneHearts-${wedding.slug}-Photos.zip`);
      notify({ title: 'Download started', description: 'All wedding photos bundled into ZIP.' });
    } finally {
      setZipping(false);
    }
  }

  if (loading) return <LoadingScreen />;

  if (!wedding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] p-6 text-center">
        <BrandLogo size="lg" showSubtext centered />
        <h1 className="font-serif text-2xl font-semibold mt-6">No Wedding Assigned Yet</h1>
        <p className="text-sm text-[#7A6F67] max-w-md mt-2">
          Ask your OneHearts platform administrator to link your email address to your wedding
          profile.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#E8DFD3] bg-white px-5 py-2.5 text-xs font-semibold hover:bg-[#FAF8F5]"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out &amp; Try Another Email
        </button>
      </div>
    );
  }

  const activeColor = wedding.custom_primary_color || '#B8925A';
  const guestUploadUrl = `${origin}/${wedding.slug}/memories`;

  function copyUploadLink() {
    navigator.clipboard.writeText(guestUploadUrl);
    setCopiedLink(true);
    notify({ title: 'Memories link copied', variant: 'info' });
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2520]">
      
      <header className="bg-white border-b border-[#E8DFD3] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <BrandLogo size="md" />
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            disabled={syncing}
            onClick={() => syncWeddingData(wedding.id, true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E8DFD3] px-3.5 py-2 text-xs font-medium hover:bg-[#FAF8F5] disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}
              style={{ color: activeColor }}
            />
            {syncing ? 'Syncing...' : 'Sync Latest'}
          </button>
          <a
            href={`/${wedding.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: activeColor }}
            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            Preview Live Wedding <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E8DFD3] px-4 py-2 text-xs font-medium hover:bg-[#FAF8F5]"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid lg:grid-cols-12 gap-8">
        {/* Left Column: Printable Table QR Code Card */}
        <aside className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A6F67] flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5" style={{ color: activeColor }} /> Reception Table QR Card
          </h2>

         <PrintableTableQrCard
          partner1Name={wedding.partner1_name}
          partner2Name={wedding.partner2_name}
          scanUrl={guestUploadUrl}
          accentColor={activeColor}
        />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              style={{ backgroundColor: activeColor }}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90"
            >
              <Printer className="w-3.5 h-3.5" /> Print Card
            </button>
            <button
              type="button"
              onClick={copyUploadLink}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E8DFD3] bg-white px-4 py-2.5 text-xs font-semibold hover:bg-[#FAF8F5]"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Right Column: Wedding Setup, Pre-Wedding Gallery & Moderation */}
        <div className="lg:col-span-8 space-y-8">
          <form
            onSubmit={handleSave}
            className="rounded-3xl bg-white border border-[#E8DFD3] p-6 sm:p-8 space-y-6"
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-[#7A6F67]">
                Couple Backroom &bull; Status: <strong className="uppercase">{wedding.status}</strong>
              </span>
              <h1 className="font-serif text-3xl font-semibold mt-1">
                {wedding.partner1_name} &amp; {wedding.partner2_name}
              </h1>
            </div>

            {/* Wedding Color Code Picker */}
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF8F5]/70 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" style={{ color: activeColor }} />
                <h2 className="text-sm font-semibold">Wedding Color Code &amp; Theme</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {WEDDING_COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => updateField('custom_primary_color', swatch.hex)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      activeColor.toLowerCase() === swatch.hex.toLowerCase()
                        ? 'border-[#2C2520] bg-white shadow-sm'
                        : 'border-[#E8DFD3] bg-white/60'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    {swatch.name}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-medium block mb-1">
                    Custom Color Picker (Hex Code)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeColor}
                      onChange={(e) => updateField('custom_primary_color', e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-[#E8DFD3]"
                    />
                    <input
                      type="text"
                      value={activeColor}
                      onChange={(e) => updateField('custom_primary_color', e.target.value)}
                      className="w-full rounded-xl border border-[#E8DFD3] bg-white px-3 py-2 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1">Background Style</label>
                  <select
                    value={wedding.theme_preset}
                    onChange={(e) =>
                      updateField('theme_preset', e.target.value as Wedding['theme_preset'])
                    }
                    className="w-full rounded-xl border border-[#E8DFD3] bg-white px-3 py-2 text-sm"
                  >
                    <option value="champagne">Warm Ivory</option>
                    <option value="rose">Soft Blush</option>
                    <option value="sage">Botanical Mist</option>
                    <option value="midnight">Evening Dark</option>
                    <option value="emerald">Royal Emerald Mist</option>
                    <option value="burgundy">Velvet Burgundy Blush</option>
                    <option value="terracotta">Warm Terracotta Clay</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Couple Details, Date & Venue */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium">Partner 1 Name</label>
                <input
                  type="text"
                  value={wedding.partner1_name}
                  onChange={(e) => updateField('partner1_name', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Partner 2 Name</label>
                <input
                  type="text"
                  value={wedding.partner2_name}
                  onChange={(e) => updateField('partner2_name', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Wedding Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={toLocalDateTimeInput(wedding.wedding_date)}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const parsed = new Date(e.target.value);
                    if (!isNaN(parsed.getTime())) {
                      updateField('wedding_date', parsed.toISOString());
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Venue Name</label>
                <input
                  type="text"
                  value={wedding.venue_name}
                  onChange={(e) => updateField('venue_name', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium">Our Love Story</label>
                <textarea
                  rows={3}
                  value={wedding.love_story || ''}
                  onChange={(e) => updateField('love_story', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Hero Cover Photo Uploader */}
            <div className="space-y-2">
              <label className="text-xs font-medium block">Hero Cover Photo</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-[#E8DFD3] bg-[#FAF8F5]/60 p-4">
                {wedding.hero_image_url ? (
                  <img
                    src={wedding.hero_image_url}
                    alt="Cover preview"
                    className="h-20 w-32 rounded-xl object-cover border border-[#E8DFD3] shrink-0"
                  />
                ) : (
                  <div className="h-20 w-32 rounded-xl border border-dashed border-[#B8925A]/50 flex items-center justify-center text-[11px] text-[#7A6F67] shrink-0">
                    No cover yet
                  </div>
                )}
                <label
                  style={{ backgroundColor: activeColor }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingCover ? 'Uploading Cover...' : 'Upload Cover Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingCover}
                    onChange={handleCoverFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Pre-Wedding Shoot Gallery Uploader + Preview Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">
                  Pre-Wedding Shoot Gallery ({(wedding.pre_wedding_photos || []).length})
                </span>
                <label
                  style={{ borderColor: activeColor, color: activeColor }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold hover:opacity-80"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingPreWedding ? 'Uploading...' : 'Add Pre-Wedding Photos'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingPreWedding}
                    onChange={handlePreWeddingUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {(wedding.pre_wedding_photos || []).length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 rounded-2xl border border-[#E8DFD3] bg-[#FAF8F5]/60 p-3">
                  {(wedding.pre_wedding_photos || []).map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#E8DFD3] bg-white"
                    >
                      <img
                        src={photoUrl}
                        alt={`Pre-wedding ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePreWeddingPhoto(photoUrl)}
                        className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1.5 text-white hover:bg-rose-600 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule Builder */}
            <div className="space-y-3 pt-2 border-t border-[#E8DFD3]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" style={{ color: activeColor }} /> Wedding Day Schedule
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateField('schedule', [
                      ...(wedding.schedule || []),
                      {
                        time: '4:00 PM',
                        title: 'Reception',
                        location: 'Main Hall',
                        description: '',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-[#E8DFD3] px-3 py-1 text-xs hover:bg-[#FAF8F5]"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Event
                </button>
              </div>
              {(wedding.schedule || []).map((item: ScheduleItem, idx: number) => (
                <div key={idx} className="rounded-xl bg-[#FAF8F5] p-3 space-y-2">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Time"
                      value={item.time}
                      onChange={(e) => {
                        const copy = [...wedding.schedule];
                        copy[idx] = { ...copy[idx], time: e.target.value };
                        updateField('schedule', copy);
                      }}
                      className="rounded-lg border border-[#E8DFD3] bg-white px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Event Title"
                      value={item.title}
                      onChange={(e) => {
                        const copy = [...wedding.schedule];
                        copy[idx] = { ...copy[idx], title: e.target.value };
                        updateField('schedule', copy);
                      }}
                      className="rounded-lg border border-[#E8DFD3] bg-white px-2.5 py-1.5 text-xs"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Location"
                        value={item.location}
                        onChange={(e) => {
                          const copy = [...wedding.schedule];
                          copy[idx] = { ...copy[idx], location: e.target.value };
                          updateField('schedule', copy);
                        }}
                        className="w-full rounded-lg border border-[#E8DFD3] bg-white px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            'schedule',
                            wedding.schedule.filter((_, i) => i !== idx)
                          )
                        }
                        className="rounded-lg border border-rose-200 bg-white px-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Short description (optional)"
                    value={item.description}
                    onChange={(e) => {
                      const copy = [...wedding.schedule];
                      copy[idx] = { ...copy[idx], description: e.target.value };
                      updateField('schedule', copy);
                    }}
                    className="w-full rounded-lg border border-[#E8DFD3] bg-white px-2.5 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>

            {/* Guest Camera Controls */}
            <div className="space-y-2.5 pt-3 border-t border-[#E8DFD3]">
              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={wedding.require_photo_approval}
                  onChange={(e) => updateField('require_photo_approval', e.target.checked)}
                />
                Require our approval before guest photos appear publicly
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(wedding.restrict_uploads_until_wedding_day)}
                  onChange={(e) =>
                    updateField('restrict_uploads_until_wedding_day', e.target.checked)
                  }
                />
                Restrict guest photo uploads until our wedding day
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{ backgroundColor: activeColor }}
              className="rounded-full px-6 py-3 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition"
            >
              {saving ? 'Syncing & Publishing...' : 'Save & Update My Wedding Page'}
            </button>
          </form>

          {/* Guest Photo Moderation + ZIP Export */}
          <div className="rounded-3xl bg-white border border-[#E8DFD3] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-serif text-xl font-semibold">
                Guest Photos ({photos.length})
              </h2>
              <button
                type="button"
                disabled={zipping || photos.length === 0}
                onClick={handleDownloadAllZip}
                style={{ backgroundColor: activeColor }}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {zipping ? 'Bundling ZIP...' : 'Download All as ZIP'}
              </button>
            </div>

            {photos.length === 0 ? (
              <p className="text-xs text-[#7A6F67]">
                No guest photos uploaded yet. Print your Table QR Card to collect memories on your
                wedding day.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="rounded-xl border border-[#E8DFD3] overflow-hidden"
                  >
                    <img src={photo.image_url} alt="" className="h-32 w-full object-cover" />
                    <div className="p-2 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => togglePhotoApproval(photo)}
                        className={`inline-flex items-center gap-1 font-medium ${
                          photo.is_approved ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {photo.is_approved ? 'Live' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePhoto(photo.id)}
                        className="text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guestbook Moderation */}
          <div className="rounded-3xl bg-white border border-[#E8DFD3] p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">
              Guestbook Wishes ({wishes.length})
            </h2>
            {wishes.length === 0 ? (
              <p className="text-xs text-[#7A6F67]">No guestbook messages yet.</p>
            ) : (
              <div className="space-y-3">
                {wishes.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-start justify-between border-b border-[#E8DFD3] pb-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{w.guest_name}</p>
                      <p className="text-xs text-[#7A6F67]">{w.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteWish(w.id)}
                      className="text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}