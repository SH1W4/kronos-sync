---
name: ui-ux-consciousness
description: Elite design system protocols, premium micro-interaction standards, and visual guidelines for KRONØS SYNC (Divine Cybernetics).
---

# UI/UX Consciousness: Divine Cybernetics Protocol 🏛️

This skill governs the visual and experiential guidelines of the KRONØS SYNC platform. It ensures that every screen, button, transition, and layout adheres to the elite aesthetic standards of **Divine Cybernetics** to produce a unified, premium, and "wow" experience for both artists and clients.

## 👁️ Core Visual Pillars
Our visual system is a blend of sacred geometry, high-fidelity technology, and dark cyberpunk elegance.

### 1. The Monolithic Void (Backgrounds)
- **Rule**: Every primary view MUST use a solid `#000000` (pure OLED black) background. 
- **Effect**: This creates absolute contrast, lowers cognitive load, saves device battery, and frames UI elements as bright floating holographic widgets.
- **Tailwind classes**: `bg-black`, `bg-zinc-950` for secondary card background offsets.

### 2. Tension Colors (Contrast Palette)
- 🟢 **Esmeralda Soberana (`#00FF88`)**: Used for success, active states, valid items, and positive financial balance.
- 🟣 **Roxo de Prestígio (`#8B5CF6`)**: Used for Soul Sync gamification, level status, unlocking skins, and high-tier achievements.
- 🟠 **Laranja Cyber (`#FF5500`)**: Used for alert warnings, calendar capacity blockages, and outstanding debts.
- **Muted Offsets**: Always use low-opacity colors for borders and fills (e.g., `border-white/5`, `bg-white/5` or `border-primary/20`) to keep the design premium and prevent blinding the user.

### 3. Typography Hierarchy
- **Headers & Metrics**: Use `Orbitron` (`font-orbitron`). It projects spatial solidity and advanced telemetry.
- **Log & Code Elements**: Use `JetBrains Mono` or generic mono (`font-mono`) for dates, timestamps, money figures, and IDs.
- **Body & Controls**: Use `Inter` or standard sans-serif geometric font (`font-sans`) to ensure absolute readability and clean lines.

---

## ⚡ Micro-Interactions & Premium Aesthetics

### 1. Gooey Buttons (Fluid Tension)
- Interactive action buttons must feel "alive". When hovered, apply smooth scaling and glow transitions.
- **Glow Shadow**: `shadow-[0_0_20px_rgba(0,255,136,0.15)]` on hover to give a holographic, light-emitting appearance.

### 2. Holographic Glassmorphism
- Cards must look like semi-transparent glass panel overlays.
- **CSS Formula**:
  ```tsx
  className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl"
  ```

### 3. Layout Control & Responsiveness
- **Desktop/Artist HUD**: Informative, compact, and packed with widgets, graphs (`recharts`), and list item triggers.
- **Mobile/Tablet Kiosk**: Massive touch targets, bold input fields, and single-column steps to prevent mistakes when clients are signing sheets.
- **PWA Zoom Prevention**: Always enforce `maximumScale: 1, userScalable: false` in the viewport config of Next.js layouts to prevent accidental zoom double-taps on tablet screens.

---

## 📜 UI/UX Checklist for New Components
1. **Does it respect OLED Black?** Avoid using solid dark-gray backgrounds (`bg-gray-800` or similar) for main wrappers. Keep the core page `#000000`.
2. **Is it readable?** High contrast is non-negotiable. Text must be `text-white` or `text-zinc-400` / `text-zinc-500`.
3. **Are transitions smooth?** Use `framer-motion` for page transits or native CSS `transition-all duration-300 ease-out` on buttons and hover cards.
4. **Is it mobile-touch friendly?** Tap targets on Kiosk and Calendar must have at least `44px` height.
