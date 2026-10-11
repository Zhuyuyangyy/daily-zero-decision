/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background palette — warm pink-tinted neutrals (claymorphism)
        canvas: '#FDF4F0',        // soft pink-cream canvas
        cream: '#FFF6EE',         // a touch warmer for cards
        clay: {
          // Primary "clay" base for buttons / cards
          DEFAULT: '#FBC9C0',     // peachy clay
          soft: '#FFE3DC',
          deep: '#E89A8E',
        },
        mint: {
          light: '#d9f2d8',
          DEFAULT: '#A8E6B5',     // a bit mintier, less lime
          dark: '#6FCF8A',        // "clay green" — desaturated, deeper
          clay: '#88D8A4',        // button fill
          clayLight: '#C4EDCF',
          clayDeep: '#5DBF7B',
        },
        sakura: {
          light: '#FDE2E8',
          DEFAULT: '#FBB4C2',
          dark: '#E89AAE',
          clay: '#F2A6B6',
        },
        ink: {
          light: '#8A7F75',       // warm grey, never cold
          DEFAULT: '#3D3530',
          dark: '#1F1A17',
        },
      },
      fontFamily: {
        display: ['ZCOOL KuaiLe', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'PingFang SC', 'Hiragino Sans GB', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'btn': '20px',              // T1 调整到 20-28 大圆角
        'card': '24px',
        'chunk': '28px',
        'blob': '48px',
        'hero': '36px',
        'chip': '9999px',
      },
      lineHeight: {
        'tight':    '1.15',
        'snug':     '1.35',
        'normal':   '1.6',
        'relaxed':  '1.75',         // T1 治愈系正文默认 1.7-1.8
        'loose':    '1.85',
      },
      transitionTimingFunction: {
        'clay-out': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'clay-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'clay-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
      },
      boxShadow: {
        // === T1 晨昏天空版黏土阴影 (默认 5-3-2 配色) ===
        'clay-soft': '0 4px 12px rgba(248, 140, 130, 0.12), 0 1px 3px rgba(248, 140, 130, 0.08), inset 0 2px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 3px rgba(248, 140, 130, 0.10)',
        'clay': '0 8px 24px rgba(248, 140, 130, 0.18), 0 3px 8px rgba(248, 140, 130, 0.10), inset 0 3px 4px rgba(255, 255, 255, 0.95), inset 0 -3px 5px rgba(248, 140, 130, 0.15)',
        'clay-deep': '0 14px 36px rgba(248, 140, 130, 0.22), 0 4px 12px rgba(248, 140, 130, 0.12), inset 0 2px 3px rgba(255, 255, 255, 1), inset 0 -4px 8px rgba(248, 140, 130, 0.15)',
        'clay-pressed': 'inset 0 3px 5px rgba(248, 140, 130, 0.25), inset 0 -2px 3px rgba(255, 255, 255, 0.5)',
        'clay-mint': '0 8px 24px rgba(74, 181, 116, 0.30), 0 3px 8px rgba(74, 181, 116, 0.15), inset 0 3px 4px rgba(255, 255, 255, 0.9), inset 0 -3px 5px rgba(47, 139, 87, 0.20)',
        'clay-mint-pressed': 'inset 0 4px 6px rgba(58, 154, 96, 0.4), inset 0 -2px 3px rgba(255, 255, 255, 0.4)',
        'clay-card': '0 14px 36px rgba(248, 140, 130, 0.18), 0 4px 12px rgba(248, 140, 130, 0.08), inset 0 2px 3px rgba(255, 255, 255, 1), inset 0 -4px 8px rgba(248, 140, 130, 0.12)',
        'clay-cloud': '0 8px 20px rgba(248, 140, 130, 0.20), 0 2px 6px rgba(248, 140, 130, 0.10), inset 0 4px 6px rgba(255, 255, 255, 0.95), inset 0 -4px 8px rgba(170, 200, 175, 0.20)',
        'clay-cta': '0 4px 0 #3A9A60, inset 0 1px 2px rgba(255, 255, 255, 0.5)',
        'clay-input': 'inset 0 2px 4px rgba(255, 255, 255, 1), inset 0 -3px 6px rgba(248, 140, 130, 0.10), 0 6px 16px rgba(248, 140, 130, 0.10)',
        // === 旧 token 保留以兼容已写完的 T2/T5/T6/T7 ===
        'clay-soft-old': '0 6px 16px rgba(217, 153, 142, 0.18), 0 2px 6px rgba(217, 153, 142, 0.10), inset 0 2px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 3px rgba(217, 153, 142, 0.10)',
        'soft': '0 4px 20px rgba(173, 162, 150, 0.12)',
        'lift': '0 8px 30px rgba(173, 162, 150, 0.18)',
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'jump': 'jump 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        'sparkle': 'sparkle 1s ease-out forwards',
        'count-up': 'count-up 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
        'cloud-float': 'cloud-float 6s ease-in-out infinite',
        'cloud-drift': 'cloud-drift 14s ease-in-out infinite',
        'cloud-pop': 'cloud-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards',
        'sky-shift': 'sky-shift 2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'hero-rise': 'hero-rise 1.2s cubic-bezier(0.25, 1, 0.5, 1) backwards',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        jump: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.1)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        sparkle: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.5) rotate(180deg)', opacity: '0' },
        },
        'count-up': {
          '0%': { transform: 'scale(1.5)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'cloud-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'cloud-drift': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(5px)' },
        },
        'cloud-pop': {
          '0%': { transform: 'scale(0.4) translateY(-12px)', opacity: '0' },
          '60%': { transform: 'scale(1.08) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'sky-shift': {
          '0%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.08) saturate(1.05)' },
          '100%': { filter: 'brightness(1)' },
        },
        'hero-rise': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
