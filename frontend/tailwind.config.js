/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Orbitron"', "ui-sans-serif", "system-ui"],
        sans: ['"Rajdhani"', "ui-sans-serif", "system-ui"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          900: "#05060a",
          800: "#0a0d18",
          700: "#0e1322",
          600: "#141a2e",
          500: "#1c2440",
          400: "#2a3358",
          300: "#3a4578",
        },
        line: {
          DEFAULT: "#1f2942",
          strong: "#2a3766",
          glow: "#3855a8",
        },
        fg: {
          DEFAULT: "#e6ecff",
          muted: "#8a96c5",
          dim: "#5b6794",
        },
        neon: {
          cyan: "#00f0ff",
          "cyan-soft": "#3df2ff",
          magenta: "#ff2d95",
          "magenta-soft": "#ff6bb5",
          violet: "#9b5cff",
          green: "#39ff7a",
          yellow: "#ffd23f",
          red: "#ff3b6b",
        },
        // legacy alias used by some pages — map to new palette
        brand: {
          50: "#e6ecff",
          500: "#00f0ff",
          600: "#00d4e6",
          700: "#00b8c9",
          900: "#05060a",
        },
      },
      boxShadow: {
        "glow-cyan":
          "0 0 0 1px rgba(0,240,255,0.35), 0 0 24px -4px rgba(0,240,255,0.55)",
        "glow-magenta":
          "0 0 0 1px rgba(255,45,149,0.4), 0 0 24px -4px rgba(255,45,149,0.55)",
        "glow-soft":
          "0 0 18px -2px rgba(0,240,255,0.25), inset 0 0 0 1px rgba(0,240,255,0.18)",
        panel:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 40px -16px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(56,85,168,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,85,168,0.08) 1px, transparent 1px)",
        "grid-strong":
          "linear-gradient(rgba(0,240,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.18) 1px, transparent 1px)",
        "scanlines":
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)",
        "neon-fade":
          "radial-gradient(ellipse at top, rgba(0,240,255,0.12), transparent 60%), radial-gradient(ellipse at bottom right, rgba(255,45,149,0.10), transparent 55%)",
      },
      backgroundSize: {
        grid: "32px 32px",
        "grid-sm": "16px 16px",
      },
      animation: {
        "glow-pulse": "glowPulse 2.4s ease-in-out infinite",
        "scan-move": "scanMove 6s linear infinite",
        "flicker": "flicker 3.6s infinite",
        "shake-x": "shakeX 0.4s ease",
        "marquee": "marquee 30s linear infinite",
        "rise": "rise 0.6s cubic-bezier(.16,1,.3,1) both",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.85", filter: "drop-shadow(0 0 6px currentColor)" },
          "50%": { opacity: "1", filter: "drop-shadow(0 0 14px currentColor)" },
        },
        scanMove: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.55" },
        },
        shakeX: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-3px)" },
          "75%": { transform: "translateX(3px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      letterSpacing: {
        widest2: "0.22em",
      },
    },
  },
  plugins: [],
};
