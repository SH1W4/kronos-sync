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
        'sans': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: "#0A0A0A",
        foreground: "#00FF88",
        primary: {
          DEFAULT: "#00FF88",
          foreground: "#0A0A0A",
        },
        secondary: {
          DEFAULT: "#8B5CF6",
          foreground: "#0A0A0A",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#00FF88",
        },
        accent: {
          DEFAULT: "#2A2A2A",
          foreground: "#00FF88",
        },
        destructive: {
          DEFAULT: "#FF0055",
          foreground: "#FFFFFF",
        },
        border: "#00FF88",
        input: "#1A1A1A",
        ring: "#00FF88",
        // Cyber colors
        cyber: {
          green: '#00FF88',
          blue: '#00BFFF',
          purple: '#8B5CF6',
          pink: '#FF00FF',
          yellow: '#FFFF00',
          grid: '#003322',
        }
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.2s ease-out",
        "pulse-cyber": "pulseCyber 2s ease-in-out infinite",
        "glitch-1": "glitch1 0.5s infinite",
        "glitch-2": "glitch2 0.5s infinite",
        "data-flow": "dataFlow 3s linear infinite",
        "scan-line": "scanLine 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseCyber: {
          "0%, 100%": { 
            boxShadow: "0 0 5px rgba(0, 255, 136, 0.5)",
            borderColor: "rgba(0, 255, 136, 0.5)"
          },
          "50%": { 
            boxShadow: "0 0 20px rgba(0, 255, 136, 0.8)",
            borderColor: "rgba(0, 255, 136, 1)"
          },
        },
        glitch1: {
          "0%, 14%, 15%, 49%, 50%, 99%, 100%": {
            transform: "translate(0)",
          },
          "15%, 49%": {
            transform: "translate(-2px, 1px)",
          },
        },
        glitch2: {
          "0%, 20%, 21%, 62%, 63%, 99%, 100%": {
            transform: "translate(0)",
          },
          "21%, 62%": {
            transform: "translate(2px, -1px)",
          },
        },
        dataFlow: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        scanLine: {
          "0%": {
            transform: "translateY(-100%)",
          },
          "100%": {
            transform: "translateY(100vh)",
          },
        },
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
        `,
        'cyber-gradient': 'linear-gradient(45deg, #00FF88, #00BFFF)',
        'cyber-glow': 'radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%)',
        'data-pattern': `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 136, 0.1) 2px,
            rgba(0, 255, 136, 0.1) 4px
          )
        `,
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(0, 255, 136, 0.5)',
        'cyber-lg': '0 0 40px rgba(0, 255, 136, 0.3)',
        'cyber-inner': 'inset 0 0 20px rgba(0, 255, 136, 0.1)',
        'cyber-glow': '0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config;

