import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-pretendard)', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cana: {
          DEFAULT: '#b5436a',
          light: '#d4849f',
          dark: '#8f3254',
          muted: '#fdf3f6',
          rule:  '#e8d5dc',
          ink:   '#1e1218',
          ink2:  '#5c3a47',
          ink3:  '#a07080',
          warm:  '#f7ede8',
          cream: '#fffaf8',
        },
      },
    },
  },
  plugins: [],
};
export default config;
