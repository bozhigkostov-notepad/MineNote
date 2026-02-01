
import React from 'react';

export const COLORS = {
  MC_DARK: '#373737',
  MC_GREY: '#8b8b8b',
  MC_LIGHT: '#c6c6c6',
  MC_BLACK: '#000000',
  MC_WHITE: '#ffffff',
  MC_GREEN: '#55ff55',
  MC_RED: '#ff5555',
  MC_YELLOW: '#ffff55',
};

export const PIXEL_ICONS = {
  Paper: (props: any) => (
    <svg viewBox="0 0 16 16" width="32" height="32" {...props}>
      <path d="M4 2h7l2 2v10H4V2z" fill="#fff" />
      <path d="M5 4h6M5 6h6M5 8h6M5 10h4" stroke="#000" strokeWidth="1" />
    </svg>
  ),
  Book: (props: any) => (
    <svg viewBox="0 0 16 16" width="32" height="32" {...props}>
      <path d="M3 2h10v12H3V2z" fill="#8B4513" />
      <path d="M4 3h8v10H4V3z" fill="#D2B48C" />
      <path d="M4 3h1v10h-1z" fill="#000" fillOpacity="0.2" />
    </svg>
  ),
  Feather: (props: any) => (
    <svg viewBox="0 0 16 16" width="32" height="32" {...props}>
      <path d="M12 2l-2 2-6 8-2 2 1-1 1-1 8-8 2-2-2 0z" fill="#fff" />
      <path d="M4 12l2-2" stroke="#000" />
    </svg>
  ),
  Enchant: (props: any) => (
    <svg viewBox="0 0 16 16" width="32" height="32" {...props}>
      <path d="M8 2l2 2v8l-2 2-2-2V4l2-2z" fill="#9370DB" />
      <circle cx="8" cy="8" r="4" fill="#E6E6FA" fillOpacity="0.5" />
    </svg>
  ),
  CraftingTable: (props: any) => (
    <svg viewBox="0 0 16 16" width="32" height="32" {...props}>
      <path d="M1 1h14v14H1V1z" fill="#8B4513" />
      <path d="M2 2h12v12H2V2z" fill="#A0522D" />
      <path d="M3 3h3v3H3V3z" fill="#DEB887" />
      <path d="M10 3h3v3h-3V3z" fill="#DEB887" />
      <path d="M3 10h3v3H3v-3z" fill="#DEB887" />
      <path d="M10 10h3v3h-3v-3z" fill="#DEB887" />
      <path d="M7 7h2v2H7V7z" fill="#000" fillOpacity="0.2" />
    </svg>
  ),
  Chest: (props: any) => (
    <svg viewBox="0 0 16 16" width="32" height="32" {...props}>
      <path d="M1 3h14v11H1V3z" fill="#8B4513" />
      <path d="M1 3h14v2H1V3z" fill="#5D2906" />
      <path d="M7 4h2v3H7V4z" fill="#C0C0C0" />
      <path d="M7 5h2v1H7V5z" fill="#808080" />
    </svg>
  ),
  Lava: (props: any) => (
    <svg viewBox="0 0 16 16" width="32" height="32" {...props}>
      <path d="M0 0h16v16H0V0z" fill="#D34000" />
      <path d="M2 2h4v4H2V2z" fill="#FF8000" />
      <path d="M10 4h4v4h-4V4z" fill="#FFD000" />
      <path d="M4 10h6v4H4v-4z" fill="#FF8000" />
    </svg>
  ),
  Arrow: (props: any) => (
    <svg viewBox="0 0 16 16" width="32" height="32" {...props}>
      <path d="M2 7h8V4l5 4-5 4V9H2V7z" fill="#555" />
    </svg>
  )
};
