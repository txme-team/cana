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
          DEFAULT: '#e05c52',
          light: '#ee9088',
          dark: '#b83f38',
          muted: '#faf8f5',
          rule:  '#ddd4c8',
          ink:   '#1c1410',
          ink2:  '#4a3328',
          ink3:  '#a08878',
          warm:  '#ede8e2',
          cream: '#f4f0ec',
        },
      },
    },
  },
  plugins: [],
};
export default config;
