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
          DEFAULT: "var(--primary-color)", // Dynamic
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#333333",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#111111",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "var(--primary-color)", // Reuse primary for accent for now
          foreground: "#000000",
        },
        border: "#222222",
        input: "#111111",
        ring: "var(--primary-color)",
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
