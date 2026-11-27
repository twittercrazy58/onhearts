import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export interface ScheduleItem {
  time: string;
  title: string;
  location: string;
  description: string;
}

export interface Wedding {
  id: string;
  slug: string;
  status: 'draft' | 'live' | 'archived';
  couple_email?: string;
  couple_user_id?: string;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  venue_map_url?: string;
  hero_image_url?: string;
  pre_wedding_photos?: string[];
  love_story?: string;
  theme_preset: 'champagne' | 'rose' | 'sage' | 'midnight' | 'emerald' | 'burgundy' | 'terracotta';
  custom_primary_color?: string;
  require_photo_approval: boolean;
  restrict_uploads_until_wedding_day?: boolean;
  schedule: ScheduleItem[];
}

export interface GuestPhoto {
  id: string;
  wedding_id: string;
  guest_name: string;
  caption?: string;
  moment_tag: string;
  image_url: string;
  media_type?: 'image' | 'video';
  likes_count: number;
  is_approved: boolean;
  created_at: string;
}

export interface GuestWish {
  id: string;
  wedding_id: string;
  guest_name: string;
  relationship?: string;
  message: string;
  is_approved: boolean;
  created_at: string;
}