export type ThemePresetKey =
  | 'champagne'
  | 'rose'
  | 'sage'
  | 'midnight'
  | 'emerald'
  | 'burgundy'
  | 'terracotta';

export interface ThemeConfig {
  label: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  defaultPrimary: string;
}

export const THEME_PRESETS: Record<ThemePresetKey, ThemeConfig> = {
  champagne: {
    label: 'Champagne Gold',
    bg: 'bg-[#FAF8F5]',
    surface: 'bg-white',
    text: 'text-[#2C2520]',
    muted: 'text-[#7A6F67]',
    border: 'border-[#E8DFD3]',
    defaultPrimary: '#B8925A',
  },
  rose: {
    label: 'Dusty Rose',
    bg: 'bg-[#FDF7F7]',
    surface: 'bg-white',
    text: 'text-[#332224]',
    muted: 'text-[#82686B]',
    border: 'border-[#EEDBDC]',
    defaultPrimary: '#C07A80',
  },
  sage: {
    label: 'Botanical Sage',
    bg: 'bg-[#F5F8F5]',
    surface: 'bg-white',
    text: 'text-[#212D24]',
    muted: 'text-[#637467]',
    border: 'border-[#DCE5DD]',
    defaultPrimary: '#5D8266',
  },
  midnight: {
    label: 'Midnight & Gold',
    bg: 'bg-[#121417]',
    surface: 'bg-[#1B1E23]',
    text: 'text-[#F6F3EE]',
    muted: 'text-[#A6A096]',
    border: 'border-[#2D3139]',
    defaultPrimary: '#D4AF6A',
  },
  emerald: {
    label: 'Royal Emerald & Gold',
    bg: 'bg-[#F4F8F6]',
    surface: 'bg-white',
    text: 'text-[#152820]',
    muted: 'text-[#556E63]',
    border: 'border-[#D4E3DC]',
    defaultPrimary: '#1B5E43',
  },
  burgundy: {
    label: 'Velvet Burgundy & Wine',
    bg: 'bg-[#FBF6F7]',
    surface: 'bg-white',
    text: 'text-[#2E161C]',
    muted: 'text-[#7B5A62]',
    border: 'border-[#EAD6DA]',
    defaultPrimary: '#7A2438',
  },
  terracotta: {
    label: 'Warm Terracotta & Clay',
    bg: 'bg-[#FBF7F4]',
    surface: 'bg-white',
    text: 'text-[#31211B]',
    muted: 'text-[#7D665D]',
    border: 'border-[#ECDDD4]',
    defaultPrimary: '#B55A3C',
  },
};

export function getWeddingBrandColor(wedding: {
  theme_preset: ThemePresetKey;
  custom_primary_color?: string | null;
}): string {
  if (wedding.custom_primary_color && wedding.custom_primary_color.trim()) {
    return wedding.custom_primary_color;
  }
  return (THEME_PRESETS[wedding.theme_preset] || THEME_PRESETS.champagne).defaultPrimary;
}