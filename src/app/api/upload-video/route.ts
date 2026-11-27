import { NextResponse } from 'next/server';
import { Bucket, uniquePath } from '@upstash/blob';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
]);

const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25 MB

const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const weddingId = formData.get('weddingId');

    if (!(file instanceof File) || typeof weddingId !== 'string' || !weddingId) {
      return NextResponse.json({ error: 'Missing video file or wedding ID.' }, { status: 400 });
    }

    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported format. Please upload MP4, MOV, or WebM.' },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: 'Video must be 25 MB or smaller.' }, { status: 400 });
    }

    const { data: wedding } = await supabasePublic
      .from('weddings')
      .select('id')
      .eq('id', weddingId)
      .maybeSingle();

    if (!wedding) {
      return NextResponse.json({ error: 'Invalid wedding celebration.' }, { status: 404 });
    }

    const bucket = Bucket.fromEnv();
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const objectPath = uniquePath(`weddings/${weddingId}/${cleanName}`);

    const result = await bucket.put(objectPath, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error('Upstash Blob upload error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Video upload failed.' },
      { status: 500 }
    );
  }
}