'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import imageCompression from 'browser-image-compression';
import { supabase, Wedding, GuestPhoto, GuestWish, ScheduleItem } from '@/lib/supabase';
import { BrandLogo } from '@/components/BrandLogo';
import { Footer } from '@/components/Footer';
import { useFeedback } from '@/components/FeedbackProvider';
import { PrintableTableQrCard } from '@/components/PrintableTableQrCard';
import {
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  LogOut,
  Download,
  Printer,
  Copy,
  Check,
  Clock,
  QrCode,
  Upload,
  RefreshCw,
} from 'lucide-react';

function toLocalDateTimeInput(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getMediaExtension(photo: GuestPhoto, blobType: string): string {
  if (photo.media_type === 'video' || blobType.startsWith('video/')) {
    if (blobType.includes('quicktime') || photo.image_url.toLowerCase().endsWith('.mov')) {
      return 'mov';
    }
    if (blobType.includes('webm') || photo.image_url.toLowerCase().endsWith('.webm')) {
      return 'webm';
    }
    return 'mp4';
  }
  return blobType.includes('png') ? 'png' : 'jpg';
}

export default function AdminStudioPage() {
  const router = useRouter();
  const { notify, confirm } = useFeedback();

  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPreWedding, setUploadingPreWedding] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [origin, setOrigin] = useState('https://onehearts.app');

  // Track only fields modified locally since last load/save so concurrent edits don't overwrite each other
  const dirtyFieldsRef = useRef<Set<keyof Wedding>>(new Set());

  function updateField<K extends keyof Wedding>(field: K, value: Wedding[K]) {
    dirtyFieldsRef.current.add(field);
    setSelectedWedding((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  const fetchLatestWedding = useCallback(async (weddingId: string): Promise<Wedding | null> => {
    const { data } = await supabase
      .from('weddings')
      .select('*')
      .eq('id', weddingId)
      .single();
    return (data as Wedding) || null;
  }, []);

  const syncActiveWeddingData = useCallback(
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
          setSelectedWedding(latestWedding);
          setWeddings((prev) =>
            prev.map((item) => (item.id === latestWedding.id ? latestWedding : item))
          );
        }
        setPhotos(p || []);
        setWishes(w || []);

        if (showToast) {
          notify({
            title: 'Synced with latest updates',
            description: 'Fetched the newest wedding details, memories, and wishes.',
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

    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }
      const { data } = await supabase
        .from('weddings')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setWeddings(data);
        setSelectedWedding(data[0]);
      }
    }
    init();
  }, [router]);

  // Load moderation items + subscribe to live changes from Couple Studio or Guests
  useEffect(() => {
    if (!selectedWedding?.id) return;
    const weddingId = selectedWedding.id;

    syncActiveWeddingData(weddingId, false);

    const channel = supabase
      .channel(`admin-sync-${weddingId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'weddings', filter: `id=eq.${weddingId}` },
        (payload) => {
          const incoming = payload.new as Wedding;
          setWeddings((prev) => prev.map((w) => (w.id === incoming.id ? incoming : w)));
          setSelectedWedding((current) => {
            if (!current || current.id !== incoming.id) return current;
            // Preserve any unsaved local edits while merging remote updates
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
  }, [selectedWedding?.id, syncActiveWeddingData]);

  async function handleCreateNewWedding() {
    const slug = `couple-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data, error } = await supabase
      .from('weddings')
      .insert({
        slug,
        status: 'live',
        partner1_name: 'Partner One',
        partner2_name: 'Partner Two',
        wedding_date: new Date(Date.now() + 86400000 * 30).toISOString(),
        venue_name: 'The Grand Conservatory',
        venue_address: '123 Celebration Avenue',
        theme_preset: 'champagne',
        custom_primary_color: '#B8925A',
        require_photo_approval: false,
        restrict_uploads_until_wedding_day: false,
        pre_wedding_photos: [],
        schedule: [
          {
            time: '2:00 PM',
            title: 'Wedding Ceremony',
            location: 'Main Chapel',
            description: 'Exchange of vows',
          },
          {
            time: '5:00 PM',
            title: 'Cocktail & Reception',
            location: 'Garden Pavilion',
            description: 'Dinner, toasts, and dancing',
          },
        ],
      })
      .select()
      .single();

    if (error) {
      notify({ title: 'Could not create wedding', description: error.message, variant: 'error' });
      return;
    }

    if (data) {
      dirtyFieldsRef.current.clear();
      setWeddings([data, ...weddings]);
      setSelectedWedding(data);
      notify({
        title: 'New wedding instance created',
        description: `Ready to configure /${data.slug}`,
        variant: 'success',
      });
    }
  }

  async function handleStatusChange(status: 'draft' | 'live' | 'archived') {
    if (!selectedWedding) return;
    const { data: updated, error } = await supabase
      .from('weddings')
      .update({ status })
      .eq('id', selectedWedding.id)
      .select()
      .single();

    if (error) {
      notify({ title: 'Status update failed', description: error.message, variant: 'error' });
      return;
    }

    if (updated) {
      setSelectedWedding((prev) => (prev ? { ...updated, ...getDirtyOverrides(prev) } : updated));
      setWeddings((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      notify({ title: `Wedding marked as ${status.toUpperCase()}`, variant: 'info' });
    }
  }

  function getDirtyOverrides(current: Wedding): Partial<Wedding> {
    const overrides: Partial<Wedding> = {};
    dirtyFieldsRef.current.forEach((key) => {
      (overrides as Record<string, unknown>)[key] = current[key];
    });
    return overrides;
  }

  async function handleDeleteWedding(wedding: Wedding) {
    const approved = await confirm({
      title: `Delete ${wedding.partner1_name} & ${wedding.partner2_name}'s Wedding?`,
      description:
        'This permanently deletes the wedding page, pre-wedding portraits, guest photos, videos, and guestbook wishes. This action cannot be undone.',
      confirmLabel: 'Yes, Delete Permanently',
      cancelLabel: 'Keep Wedding',
      destructive: true,
    });
    if (!approved) return;

    const { error } = await supabase.from('weddings').delete().eq('id', wedding.id);
    if (error) {
      notify({ title: 'Delete failed', description: error.message, variant: 'error' });
      return;
    }

    dirtyFieldsRef.current.clear();
    const remaining = weddings.filter((w) => w.id !== wedding.id);
    setWeddings(remaining);
    setSelectedWedding(remaining[0] || null);
    notify({ title: 'Wedding permanently deleted', variant: 'info' });
  }

  async function handleCoverFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedWedding) return;

    setUploadingCover(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.9,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const filePath = `covers/${selectedWedding.id}/${Date.now()}-${cleanName}`;

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
        .eq('id', selectedWedding.id)
        .select()
        .single();

      if (fresh) {
        dirtyFieldsRef.current.delete('hero_image_url');
        setSelectedWedding((prev) => (prev ? { ...fresh, ...getDirtyOverrides(prev) } : fresh));
        setWeddings((prev) => prev.map((w) => (w.id === fresh.id ? fresh : w)));
      }
      notify({ title: 'Cover photo updated', variant: 'success' });
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  }

  async function handlePreWeddingUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !selectedWedding) return;

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
        const filePath = `pre-wedding/${selectedWedding.id}/${Date.now()}-${cleanName}`;

        const { error: uploadErr } = await supabase.storage
          .from('wedding-memories')
          .upload(filePath, compressed, { upsert: true });

        if (uploadErr) {
          notify({
            title: `Failed to upload ${file.name}`,
            description: uploadErr.message,
            variant: 'error',
          });
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('wedding-memories')
          .getPublicUrl(filePath);
        newUrls.push(publicUrlData.publicUrl);
      }

      if (newUrls.length > 0) {
        // Fetch the newest DB array first so concurrent uploads from Couple Studio aren't overwritten
        const latest = await fetchLatestWedding(selectedWedding.id);
        const basePhotos = latest?.pre_wedding_photos || selectedWedding.pre_wedding_photos || [];
        const merged = [...basePhotos, ...newUrls];

        const { data: updatedWedding } = await supabase
          .from('weddings')
          .update({ pre_wedding_photos: merged })
          .eq('id', selectedWedding.id)
          .select()
          .single();

        if (updatedWedding) {
          setSelectedWedding((prev) =>
            prev ? { ...updatedWedding, ...getDirtyOverrides(prev) } : updatedWedding
          );
          setWeddings((prev) =>
            prev.map((w) => (w.id === updatedWedding.id ? updatedWedding : w))
          );
        }
        notify({
          title: `${newUrls.length} pre-wedding portrait(s) uploaded`,
          variant: 'success',
        });
      }
    } finally {
      setUploadingPreWedding(false);
      e.target.value = '';
    }
  }

  async function handleRemovePreWeddingPhoto(urlToRemove: string) {
    if (!selectedWedding) return;

    // Fetch latest DB array before filtering so concurrent additions stay intact
    const latest = await fetchLatestWedding(selectedWedding.id);
    const basePhotos = latest?.pre_wedding_photos || selectedWedding.pre_wedding_photos || [];
    const filtered = basePhotos.filter((url) => url !== urlToRemove);

    const { data: updatedWedding } = await supabase
      .from('weddings')
      .update({ pre_wedding_photos: filtered })
      .eq('id', selectedWedding.id)
      .select()
      .single();

    if (updatedWedding) {
      setSelectedWedding((prev) =>
        prev ? { ...updatedWedding, ...getDirtyOverrides(prev) } : updatedWedding
      );
      setWeddings((prev) =>
        prev.map((w) => (w.id === updatedWedding.id ? updatedWedding : w))
      );
    }
    notify({ title: 'Pre-wedding photo removed', variant: 'info' });
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWedding) return;
    setSaving(true);

    try {
      // 1. Fetch the newest row from Supabase before saving
      const latest = await fetchLatestWedding(selectedWedding.id);

      // 2. Build a patch containing ONLY fields modified in this session (or full payload if none tracked)
      const patch: Partial<Wedding> = {};
      if (dirtyFieldsRef.current.size > 0) {
        dirtyFieldsRef.current.forEach((field) => {
          if (field === 'couple_email') {
            patch.couple_email = selectedWedding.couple_email?.trim().toLowerCase() || null;
          } else {
            (patch as Record<string, unknown>)[field] = selectedWedding[field];
          }
        });
      } else {
        Object.assign(patch, {
          ...selectedWedding,
          couple_email: selectedWedding.couple_email?.trim().toLowerCase() || null,
        });
      }

      const { data: savedRow, error } = await supabase
        .from('weddings')
        .update(patch)
        .eq('id', selectedWedding.id)
        .select()
        .single();

      if (error) {
        notify({ title: 'Save failed', description: error.message, variant: 'error' });
        return;
      }

      const finalWedding = savedRow || (latest ? { ...latest, ...patch } : selectedWedding);
      dirtyFieldsRef.current.clear();
      setSelectedWedding(finalWedding);
      setWeddings((prev) =>
        prev.map((w) => (w.id === finalWedding.id ? finalWedding : w))
      );
      notify({
        title: 'Wedding published!',
        description: 'Merged with latest data and saved live.',
        variant: 'success',
      });
    } finally {
      setSaving(false);
    }
  }

  function addScheduleItem() {
    if (!selectedWedding) return;
    const nextSchedule: ScheduleItem[] = [
      ...(selectedWedding.schedule || []),
      {
        time: '7:00 PM',
        title: 'First Dance & Cake Cutting',
        location: 'Grand Hall',
        description: '',
      },
    ];
    updateField('schedule', nextSchedule);
  }

  function updateScheduleItem(index: number, field: keyof ScheduleItem, value: string) {
    if (!selectedWedding) return;
    const updated = [...(selectedWedding.schedule || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('schedule', updated);
  }

  function removeScheduleItem(index: number) {
    if (!selectedWedding) return;
    const filtered = (selectedWedding.schedule || []).filter((_, idx) => idx !== index);
    updateField('schedule', filtered);
  }

  async function handleDownloadAllZip() {
    if (!selectedWedding || photos.length === 0) return;
    setZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(`${selectedWedding.slug}-memories`) || zip;

      await Promise.all(
        photos.map(async (photo, idx) => {
          try {
            const response = await fetch(photo.image_url);
            const blob = await response.blob();
            const extension = getMediaExtension(photo, blob.type);
            const safeGuest = photo.guest_name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Guest';
            const safeTag = photo.moment_tag.replace(/[^a-zA-Z0-9_-]/g, '_');
            folder.file(
              `${String(idx + 1).padStart(3, '0')}_${safeTag}_${safeGuest}.${extension}`,
              blob
            );
          } catch (err) {
            console.error('Failed to bundle media:', photo.image_url, err);
          }
        })
      );

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `OneHearts-${selectedWedding.slug}-Memories.zip`);
      notify({ title: 'ZIP archive ready', description: 'Downloading all guest photos and videos.' });
    } finally {
      setZipping(false);
    }
  }

  async function togglePhotoApproval(photo: GuestPhoto) {
    const updated = !photo.is_approved;
    await supabase.from('guest_photos').update({ is_approved: updated }).eq('id', photo.id);
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, is_approved: updated } : p)));
    notify({
      title: updated ? 'Memory approved and live' : 'Memory hidden from public gallery',
      variant: 'info',
    });
  }

  async function deletePhoto(id: string) {
    const approved = await confirm({
      title: 'Delete Guest Memory?',
      description: 'This photo or video will be permanently removed from the wedding gallery.',
      confirmLabel: 'Delete Memory',
      destructive: true,
    });
    if (!approved) return;

    await supabase.from('guest_photos').delete().eq('id', id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    notify({ title: 'Guest memory deleted', variant: 'info' });
  }

  async function deleteWish(id: string) {
    const approved = await confirm({
      title: 'Delete Guestbook Wish?',
      description: 'This message will be permanently removed from the guestbook.',
      confirmLabel: 'Delete Wish',
      destructive: true,
    });
    if (!approved) return;

    await supabase.from('guest_wishes').delete().eq('id', id);
    setWishes((prev) => prev.filter((w) => w.id !== id));
    notify({ title: 'Guestbook wish deleted', variant: 'info' });
  }

  const guestUploadUrl = selectedWedding ? `${origin}/${selectedWedding.slug}/memories` : '';

  function copyUploadLink() {
    if (!guestUploadUrl) return;
    navigator.clipboard.writeText(guestUploadUrl);
    setCopiedLink(true);
    notify({ title: 'Memories link copied to clipboard', variant: 'info' });
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2520]">
      {/* Admin Top Bar */}
      <header className="bg-white border-b border-[#E8DFD3] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <BrandLogo size="md" />
        <div className="flex items-center gap-3">
          {selectedWedding && (
            <button
              type="button"
              disabled={syncing}
              onClick={() => syncActiveWeddingData(selectedWedding.id, true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E8DFD3] px-3.5 py-2 text-xs font-medium hover:bg-[#FAF8F5] disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#B8925A] ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Latest'}
            </button>
          )}
          <button
            onClick={handleCreateNewWedding}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#B8925A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A37F49] transition"
          >
            <Plus className="w-4 h-4" /> New Couple Wedding
          </button>
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
        {/* Left Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A6F67]">
              Active Wedding Instances ({weddings.length})
            </h2>
            {weddings.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  dirtyFieldsRef.current.clear();
                  setSelectedWedding(w);
                }}
                className={`w-full text-left rounded-2xl p-4 border transition ${
                  selectedWedding?.id === w.id
                    ? 'bg-white border-[#B8925A] shadow-sm'
                    : 'bg-white/60 border-[#E8DFD3] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-serif text-lg font-semibold">
                    {w.partner1_name} &amp; {w.partner2_name}
                  </div>
                  <span className="rounded-full bg-[#FAF8F5] border border-[#E8DFD3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#7A6F67]">
                    {w.status || 'live'}
                  </span>
                </div>
                <div className="text-xs text-[#7A6F67] mt-0.5">/{w.slug}</div>
              </button>
            ))}
          </div>

          {/* Printable Table QR Code Card */}
          {selectedWedding && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A6F67] flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#B8925A]" /> Guest Table QR Card
              </h2>

              <PrintableTableQrCard
                partner1Name={selectedWedding.partner1_name}
                partner2Name={selectedWedding.partner2_name}
                scanUrl={guestUploadUrl}
                accentColor={selectedWedding.custom_primary_color || '#B8925A'}
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#2C2520] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#443A33]"
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
                      <Copy className="w-3.5 h-3.5" /> Copy Memories Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Right Panel */}
        {selectedWedding && (
          <div className="lg:col-span-8 space-y-8">
            <form
              onSubmit={handleSaveConfig}
              className="rounded-3xl bg-white border border-[#E8DFD3] p-6 space-y-6"
            >
              {/* Lifecycle Status & Delete Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8DFD3]">
                <div className="flex items-center gap-2">
                  {(['draft', 'live', 'archived'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                        (selectedWedding.status || 'live') === st
                          ? 'bg-[#2C2520] text-white'
                          : 'border border-[#E8DFD3] text-[#7A6F67] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteWedding(selectedWedding)}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Wedding
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl font-semibold">Wedding Configuration</h2>
                <div className="flex items-center gap-4">
                  <a
                    href={`/${selectedWedding.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#B8925A] hover:underline"
                  >
                    Invitation Page <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`/${selectedWedding.slug}/memories`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2C2520] hover:underline"
                  >
                    Memories Page <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Couple Backroom Assignment */}
              <div>
                <label className="text-xs font-medium">Couple Backroom Login Email</label>
                <input
                  type="email"
                  placeholder="couple@example.com (grants access to /couple/studio)"
                  value={selectedWedding.couple_email || ''}
                  onChange={(e) => updateField('couple_email', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium">Partner 1 Name</label>
                  <input
                    type="text"
                    value={selectedWedding.partner1_name}
                    onChange={(e) => updateField('partner1_name', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Partner 2 Name</label>
                  <input
                    type="text"
                    value={selectedWedding.partner2_name}
                    onChange={(e) => updateField('partner2_name', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">URL Slug</label>
                  <input
                    type="text"
                    value={selectedWedding.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Theme Palette</label>
                  <select
                    value={selectedWedding.theme_preset}
                    onChange={(e) =>
                      updateField('theme_preset', e.target.value as Wedding['theme_preset'])
                    }
                    className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                  >
                    <option value="champagne">Champagne Gold</option>
                    <option value="rose">Dusty Rose</option>
                    <option value="sage">Botanical Sage</option>
                    <option value="midnight">Midnight &amp; Gold</option>
                    <option value="emerald">Royal Emerald &amp; Gold</option>
                    <option value="burgundy">Velvet Burgundy &amp; Wine</option>
                    <option value="terracotta">Warm Terracotta &amp; Clay</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium">Wedding Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={toLocalDateTimeInput(selectedWedding.wedding_date)}
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
                    value={selectedWedding.venue_name}
                    onChange={(e) => updateField('venue_name', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Pre-Wedding Cover Photo */}
              <div className="space-y-2">
                <label className="text-xs font-medium block">Pre-Wedding Cover Photo</label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-[#E8DFD3] bg-[#FAF8F5]/60 p-4">
                  {selectedWedding.hero_image_url ? (
                    <img
                      src={selectedWedding.hero_image_url}
                      alt="Pre-wedding cover preview"
                      className="h-24 w-36 rounded-xl object-cover border border-[#E8DFD3] shrink-0"
                    />
                  ) : (
                    <div className="h-24 w-36 rounded-xl border border-dashed border-[#B8925A]/50 flex items-center justify-center text-[11px] text-[#7A6F67] shrink-0">
                      No cover yet
                    </div>
                  )}

                  <div className="space-y-2 w-full">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#B8925A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A37F49] transition">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingCover ? 'Compressing & Uploading...' : 'Upload Photo from Device'}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingCover}
                        onChange={handleCoverFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-[#7A6F67]">
                      Automatically compressed for fast loading on guest phones. Or paste an image URL below:
                    </p>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={selectedWedding.hero_image_url || ''}
                      onChange={(e) => updateField('hero_image_url', e.target.value)}
                      className="w-full rounded-xl border border-[#E8DFD3] bg-white px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Love Story</label>
                <textarea
                  rows={3}
                  value={selectedWedding.love_story || ''}
                  onChange={(e) => updateField('love_story', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E8DFD3] px-3 py-2 text-sm"
                />
              </div>

              {/* Multi-Photo Pre-Wedding Shoot Gallery Uploader */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-medium block">
                      Pre-Wedding Shoot Gallery ({(selectedWedding.pre_wedding_photos || []).length})
                    </label>
                    <p className="text-[11px] text-[#7A6F67]">
                      Upload engagement or pre-wedding portraits to showcase on the couple&apos;s public page.
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#B8925A] px-4 py-2 text-xs font-semibold text-[#B8925A] hover:bg-[#B8925A]/10 transition">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingPreWedding ? 'Uploading Portraits...' : 'Add Pre-Wedding Photos'}
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

                {(selectedWedding.pre_wedding_photos || []).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 rounded-2xl border border-[#E8DFD3] bg-[#FAF8F5]/60 p-3">
                    {(selectedWedding.pre_wedding_photos || []).map((photoUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-[4/5] rounded-xl overflow-hidden border border-[#E8DFD3] bg-white"
                      >
                        <img
                          src={photoUrl}
                          alt={`Pre-wedding portrait ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePreWeddingPhoto(photoUrl)}
                          aria-label="Remove pre-wedding photo"
                          className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1.5 text-white opacity-90 hover:bg-rose-600 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Wedding Day Schedule Editor */}
              <div className="pt-4 border-t border-[#E8DFD3] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#B8925A]" /> Wedding Day Schedule
                  </h3>
                  <button
                    type="button"
                    onClick={addScheduleItem}
                    className="inline-flex items-center gap-1 rounded-full border border-[#E8DFD3] px-3 py-1 text-xs font-medium hover:bg-[#FAF8F5]"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#B8925A]" /> Add Event
                  </button>
                </div>

                <div className="space-y-3">
                  {(selectedWedding.schedule || []).map((item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#E8DFD3] bg-[#FAF8F5]/60 p-4 space-y-3"
                    >
                      <div className="grid sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Time (e.g., 2:00 PM)"
                          value={item.time}
                          onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                          className="rounded-xl border border-[#E8DFD3] bg-white px-3 py-2 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Event Title"
                          value={item.title}
                          onChange={(e) => updateScheduleItem(index, 'title', e.target.value)}
                          className="rounded-xl border border-[#E8DFD3] bg-white px-3 py-2 text-xs"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Location"
                            value={item.location}
                            onChange={(e) => updateScheduleItem(index, 'location', e.target.value)}
                            className="w-full rounded-xl border border-[#E8DFD3] bg-white px-3 py-2 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => removeScheduleItem(index)}
                            aria-label="Remove schedule event"
                            className="rounded-xl border border-rose-200 bg-white px-2.5 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Short description (optional)"
                        value={item.description}
                        onChange={(e) => updateScheduleItem(index, 'description', e.target.value)}
                        className="w-full rounded-xl border border-[#E8DFD3] bg-white px-3 py-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Guest Upload & Moderation Controls */}
              <div className="space-y-2.5 pt-3 border-t border-[#E8DFD3]">
                <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedWedding.require_photo_approval}
                    onChange={(e) => updateField('require_photo_approval', e.target.checked)}
                  />
                  Require administrator approval before guest uploads appear publicly
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedWedding.restrict_uploads_until_wedding_day)}
                    onChange={(e) =>
                      updateField('restrict_uploads_until_wedding_day', e.target.checked)
                    }
                  />
                  Restrict guest uploads until the wedding day
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#2C2520] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#443A33]"
              >
                {saving ? 'Syncing & Saving...' : 'Save & Publish Wedding'}
              </button>
            </form>

            {/* Photos & Videos Moderation + Bulk ZIP Download */}
            <div className="rounded-3xl bg-white border border-[#E8DFD3] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-serif text-xl font-semibold">
                  Guest Photos &amp; Videos Moderation ({photos.length})
                </h3>
                <button
                  type="button"
                  disabled={zipping || photos.length === 0}
                  onClick={handleDownloadAllZip}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#B8925A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A37F49] disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {zipping ? 'Bundling ZIP...' : 'Download All as ZIP'}
                </button>
              </div>

              {photos.length === 0 ? (
                <p className="text-xs text-[#7A6F67]">
                  No guest photos or videos uploaded yet. Share the Table QR Card to start collecting memories.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-xl border border-[#E8DFD3] overflow-hidden bg-[#FAF8F5]/40"
                    >
                      {photo.media_type === 'video' ? (
                        <video
                          src={photo.image_url}
                          controls
                          playsInline
                          preload="metadata"
                          className="h-32 w-full bg-black object-cover"
                        />
                      ) : (
                        <img
                          src={photo.image_url}
                          alt={photo.caption || photo.guest_name}
                          className="h-32 w-full object-cover"
                        />
                      )}
                      <div className="px-2.5 pt-2">
                        <p className="truncate text-[11px] font-semibold text-[#2C2520]">
                          {photo.guest_name}
                        </p>
                        <p className="truncate text-[10px] text-[#7A6F67]">
                          {photo.moment_tag}
                          {photo.media_type === 'video' ? ' • Video' : ''}
                        </p>
                      </div>
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
              <h3 className="font-serif text-xl font-semibold mb-4">
                Guestbook Moderation ({wishes.length})
              </h3>
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
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}