import { L2Theme } from '../types';

export interface ThemeConfig {
  id: L2Theme;
  name: string;
  ticker: string;
  accentColor: string; // Hex color
  primaryText: string; // Tailwind class
  bgAccent: string;   // Tailwind class
  borderAccent: string; // Tailwind class
  wallColor: string; // Tailwind class
  wallBorderTop: string;
  wallBorderRight: string;
  wallBorderBottom: string;
  wallBorderLeft: string;
  glowShadow: string; // Tailwind shadow class
  bgGradient: string; // Background canvas adjustment
}

export const L2_THEMES: Record<L2Theme, ThemeConfig> = {
  'base-blue': {
    id: 'base-blue',
    name: 'Base Mainnet',
    ticker: '🔵 BASE L2',
    accentColor: '#0052FF',
    primaryText: 'text-[#0052FF]',
    bgAccent: 'bg-[#0052FF]/10',
    borderAccent: 'border-[#0052FF]/20',
    wallColor: 'border-deep-navy',
    wallBorderTop: 'border-t-deep-navy',
    wallBorderRight: 'border-r-deep-navy',
    wallBorderBottom: 'border-b-deep-navy',
    wallBorderLeft: 'border-l-deep-navy',
    glowShadow: 'shadow-[#0052FF]/20',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(0, 82, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%)'
  },
  'optimism-amber': {
    id: 'optimism-amber',
    name: 'OP Mainnet (Amber)',
    ticker: '🔴 OP STACK',
    accentColor: '#FF0420',
    primaryText: 'text-[#FF0420]',
    bgAccent: 'bg-[#FF0420]/10',
    borderAccent: 'border-[#FF0420]/20',
    wallColor: 'border-[#5A0D15]',
    wallBorderTop: 'border-t-[#5A0D15]',
    wallBorderRight: 'border-r-[#5A0D15]',
    wallBorderBottom: 'border-b-[#5A0D15]',
    wallBorderLeft: 'border-l-[#5A0D15]',
    glowShadow: 'shadow-[#FF0420]/20',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(255, 4, 32, 0.05) 0%, rgba(255, 255, 255, 0) 70%)'
  },
  'degen-green': {
    id: 'degen-green',
    name: 'Degen L3 Terminal',
    ticker: '🟢 DEGEN L3',
    accentColor: '#00F506',
    primaryText: 'text-[#00B805]',
    bgAccent: 'bg-[#00F506]/10',
    borderAccent: 'border-[#00B805]/20',
    wallColor: 'border-[#043306]',
    wallBorderTop: 'border-t-[#043306]',
    wallBorderRight: 'border-r-[#043306]',
    wallBorderBottom: 'border-b-[#043306]',
    wallBorderLeft: 'border-l-[#043306]',
    glowShadow: 'shadow-[#00F506]/20',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(0, 245, 6, 0.04) 0%, rgba(255, 255, 255, 0) 70%)'
  },
  'blob-pink': {
    id: 'blob-pink',
    name: 'EIP-4844 Blob Pink',
    ticker: '🌸 BLOB SPACE',
    accentColor: '#FF007A',
    primaryText: 'text-[#FF007A]',
    bgAccent: 'bg-[#FF007A]/10',
    borderAccent: 'border-[#FF007A]/20',
    wallColor: 'border-[#5c032e]',
    wallBorderTop: 'border-t-[#5c032e]',
    wallBorderRight: 'border-r-[#5c032e]',
    wallBorderBottom: 'border-b-[#5c032e]',
    wallBorderLeft: 'border-l-[#5c032e]',
    glowShadow: 'shadow-[#FF007A]/20',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(255, 0, 122, 0.05) 0%, rgba(255, 255, 255, 0) 70%)'
  }
};
