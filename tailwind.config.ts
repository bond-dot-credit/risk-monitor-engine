import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Ensure these classes are never purged
    'bg-gradient-to-br',
    'from-slate-50',
    'to-blue-50',
    'dark:from-slate-900',
    'dark:to-slate-800',
    'min-h-screen',
    'container',
    'mx-auto',
    'px-4',
    'py-8',
    'text-slate-900',
    'dark:text-slate-100',
    'text-slate-600',
    'dark:text-slate-400',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

export default config
