import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        card: {
          bg: "var(--card-bg)",
          border: "var(--card-border)",
        },
        brand: {
          yellow: '#F39C12',
          blue: '#4A90E2'
        },
      },
    },
  },
  plugins: [],
};

export default config;
