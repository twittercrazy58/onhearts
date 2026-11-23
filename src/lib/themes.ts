export const THEME_PRESETS = {
  champagne: {
    name: 'Champagne Gold (Light)',
    bg: 'bg-[#FAF8F5]',
    surface: 'bg-white',
    text: 'text-[#2C2520]',
    muted: 'text-[#7A6F67]',
    border: 'border-[#E8DFD3]',
    defaultHex: '#B8925A',
  },
  rose: {
    name: 'Blush Ivory (Light)',
    bg: 'bg-[#FDF8F8]',
    surface: 'bg-white',
    text: 'text-[#332225]',
    muted: 'text-[#82686C]',
    border: 'border-[#F0DCE0]',
    defaultHex: '#B56576',
  },
  sage: {
    name: 'Botanical Mist (Light)',
    bg: 'bg-[#F6F8F6]',
    surface: 'bg-white',
    text: 'text-[#1F2922]',
    muted: 'text-[#617065]',
    border: 'border-[#DCE5DE]',
    defaultHex: '#5B7A63',
  },
  midnight: {
    name: 'Midnight Evening (Dark)',
    bg: 'bg-[#12151E]',
    surface: 'bg-[#1A1F2C]',
    text: 'text-[#F5F2EB]',
    muted: 'text-[#A0A8B8]',
    border: 'border-[#2B3245]',
    defaultHex: '#D4AF37',
  },
};

export function getWeddingBrandColor(wedding: {
  theme_preset: keyof typeof THEME_PRESETS;
  custom_primary_color?: string;
}) {
  const preset = THEME_PRESETS[wedding.theme_preset] || THEME_PRESETS.champagne;
  return wedding.custom_primary_color || preset.defaultHex;
}