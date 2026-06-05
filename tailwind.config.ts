import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a2e',
          600: '#222240',
          500: '#2d2d50',
        },
        accent: {
          primary: '#6366f1',    // indigo
          secondary: '#8b5cf6',  // purple
          glow: '#a78bfa',       // light purple glow
          success: '#10b981',    // green
          danger: '#ef4444',     // red
          warning: '#f59e0b',    // amber
          info: '#3b82f6',       // blue
        },
        neon: {
          blue: '#00d4ff',
          purple: '#b14eff',
          pink: '#ff2e97',
          green: '#00ff88',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dark-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #12121a 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)',
        'glow-gradient': 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.1) 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.1)',
        'neon-lg': '0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15)',
        'card': '0 4px 20px rgba(0,0,0,0.5), 0 0 1px rgba(99,102,241,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99,102,241,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(99,102,241,0.6), 0 0 40px rgba(139,92,246,0.2)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
