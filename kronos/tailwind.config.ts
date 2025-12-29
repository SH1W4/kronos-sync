import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'orbitron': ['Orbitron', 'monospace'],
        'sans': ['Inter', 'sans-serif'], // Usar Inter para corpo de texto é melhor leitura
      },
      colors: {
        background: "#050505", // Black Hole
        foreground: "#FFFFFF", // Pure Light
        primary: {
          DEFAULT: "var(--primary)",
          rgb: "var(--primary-rgb)",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "#000000",
        },
        ring: "var(--primary)",
      },
      borderRadius: {
        lg: "0px", // Brutalist
        md: "0px",
        sm: "0px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        // Grid sutil para o background
        'cyber-grid': `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
      },
    },
  },
  plugins: [],
} satisfies Config;
