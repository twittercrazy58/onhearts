import { uploadHandler } from '@upstash/blob';
import { createClient } from '@supabase/supabase-js';

const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Lightweight Standard Schema v1 validator for { weddingId: string }
const weddingInputSchema = {
  '~standard': {
    version: 1 as const,
    vendor: 'onehearts',
    validate(value: unknown) {
      if (
        typeof value === 'object' &&
        value !== null &&
        'weddingId' in value &&
        typeof (value as { weddingId: unknown }).weddingId === 'string' &&
        (value as { weddingId: string }).weddingId.trim().length > 0
      ) {
        return { value: { weddingId: (value as { weddingId: string }).weddingId.trim() } };
      }
      return { issues: [{ message: 'Missing valid weddingId.' }] };
    },
  },
};

export const { GET, POST } = uploadHandler({
  constraints: {
    maxSize: '25mb',
    contentTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'],
  },
  multipart: '5mb',
  input: weddingInputSchema,
  onBeforeUpload: async ({ file, input }) => {
    const { data: wedding } = await supabasePublic
      .from('weddings')
      .select('id')
      .eq('id', input.weddingId)
      .maybeSingle();

    if (!wedding) {
      throw new Error('Invalid wedding celebration.');
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    return {
      path: `weddings/${input.weddingId}/${Date.now()}-${cleanName}`,
    };
  },
});