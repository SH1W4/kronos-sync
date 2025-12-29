'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface ThemeConfig {
  // Color Palette
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string

  // Cyber Effects
  glitchIntensity: 'off' | 'low' | 'medium' | 'high'
  scanLinesEnabled: boolean
  gridOpacity: number
  pulseSpeed: 'slow' | 'normal' | 'fast'

  // Typography
  fontFamily: 'jetbrains' | 'orbitron' | 'inter'
  fontSize: 'small' | 'normal' | 'large'
  letterSpacing: 'tight' | 'normal' | 'wide'

  // Layout
  borderRadius: 'none' | 'small' | 'medium'
  shadowIntensity: 'none' | 'subtle' | 'normal' | 'intense'

  // Animations
  animationsEnabled: boolean
  transitionSpeed: 'slow' | 'normal' | 'fast'
}

export const defaultTheme: ThemeConfig = {
  primaryColor: '#00FF88',
  secondaryColor: '#8B5CF6',
  accentColor: '#00BFFF',
  backgroundColor: '#0A0A0A',
  glitchIntensity: 'medium',
  scanLinesEnabled: true,
  gridOpacity: 0.3,
  pulseSpeed: 'normal',
  fontFamily: 'jetbrains',
  fontSize: 'normal',
  letterSpacing: 'normal',
  borderRadius: 'none',
  shadowIntensity: 'normal',
  animationsEnabled: true,
  transitionSpeed: 'normal'
}

export const themePresets: Record<string, ThemeConfig> = {
  'cyber-green': {
    ...defaultTheme,
    primaryColor: '#00FF88',
    secondaryColor: '#8B5CF6',
    accentColor: '#00BFFF',
  },
  'neon-blue': {
    ...defaultTheme,
    primaryColor: '#00BFFF',
    secondaryColor: '#FF00FF',
    accentColor: '#00FF88',
  },
  'purple-haze': {
    ...defaultTheme,
    primaryColor: '#8B5CF6',
    secondaryColor: '#FF00FF',
    accentColor: '#FFFF00',
  },
  'matrix-green': {
    ...defaultTheme,
    primaryColor: '#00FF00',
    secondaryColor: '#008000',
    accentColor: '#90EE90',
    backgroundColor: '#000000',
  },
  'cyberpunk-pink': {
    ...defaultTheme,
    primaryColor: '#FF00FF',
    secondaryColor: '#FF1493',
    accentColor: '#00FFFF',
  },
  'minimal-white': {
    ...defaultTheme,
    primaryColor: '#FFFFFF',
    secondaryColor: '#CCCCCC',
    accentColor: '#999999',
    backgroundColor: '#111111',
    glitchIntensity: 'low',
    scanLinesEnabled: false,
    gridOpacity: 0.1,
  }
}

interface ThemeContextType {
  theme: ThemeConfig
  setTheme: (theme: ThemeConfig) => void
  applyPreset: (presetName: keyof typeof themePresets) => void
  resetToDefault: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme)
  const { data: session } = useSession()

  // Load theme from localStorage or Session on mount/change
  useEffect(() => {
    const savedTheme = localStorage.getItem('kronos-theme')
    let baseTheme = defaultTheme

    if (savedTheme) {
      try {
        baseTheme = { ...defaultTheme, ...JSON.parse(savedTheme) }
      } catch (e) {
        console.error('Error parsing saved theme')
      }
    }

    // Session Override (Stronger than localStorage for identity-linked theme)
    // 1. Check workspace color (Enterprise/Studio focus)
    const userData = session?.user as any
    const activeWorkspaceId = userData?.activeWorkspaceId
    const workspaces = userData?.workspaces as any[]
    const activeWorkspace = workspaces?.find(w => w.id === activeWorkspaceId)

    if (activeWorkspace?.primaryColor) {
      baseTheme = { ...baseTheme, primaryColor: activeWorkspace.primaryColor }
    } else {
      // 2. Check personal custom color (Artist focus)
      const customColor = (session?.user as any)?.customColor
      if (customColor) {
        baseTheme = { ...baseTheme, primaryColor: customColor }
      }
    }

    setThemeState(baseTheme)
  }, [session])

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement

    // Helper to extract RGB from hex
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '139, 92, 246'
    }

    // Color variables
    root.style.setProperty('--primary', theme.primaryColor)
    root.style.setProperty('--primary-rgb', hexToRgb(theme.primaryColor))
    root.style.setProperty('--secondary', theme.secondaryColor)
    root.style.setProperty('--accent', theme.accentColor)
    root.style.setProperty('--background-color', theme.backgroundColor)

    // Grid opacity
    root.style.setProperty('--grid-opacity', theme.gridOpacity.toString())

    // Animation speeds
    const speedMap = { slow: '3s', normal: '2s', fast: '1s' }
    root.style.setProperty('--pulse-speed', speedMap[theme.pulseSpeed])
    root.style.setProperty('--transition-speed', speedMap[theme.transitionSpeed])

    // Font family
    const fontMap = {
      jetbrains: "'JetBrains Mono', monospace",
      orbitron: "'Orbitron', monospace",
      inter: "'Inter', sans-serif"
    }
    root.style.setProperty('--font-family', fontMap[theme.fontFamily])

    // Font size
    const sizeMap = { small: '0.875rem', normal: '1rem', large: '1.125rem' }
    root.style.setProperty('--font-size', sizeMap[theme.fontSize])

    // Letter spacing
    const spacingMap = { tight: '-0.025em', normal: '0', wide: '0.1em' }
    root.style.setProperty('--letter-spacing', spacingMap[theme.letterSpacing])

    // Border radius
    const radiusMap = { none: '0px', small: '4px', medium: '8px' }
    root.style.setProperty('--border-radius', radiusMap[theme.borderRadius])

    // Shadow intensity
    const shadowMap = {
      none: 'none',
      subtle: '0 0 10px rgba(0, 255, 136, 0.2)',
      normal: '0 0 20px rgba(0, 255, 136, 0.5)',
      intense: '0 0 40px rgba(0, 255, 136, 0.8)'
    }
    root.style.setProperty('--shadow-cyber', shadowMap[theme.shadowIntensity])

    // Disable animations if needed
    if (!theme.animationsEnabled) {
      root.style.setProperty('--animation-duration', '0s')
    } else {
      root.style.removeProperty('--animation-duration')
    }

    // Scan lines
    if (!theme.scanLinesEnabled) {
      root.style.setProperty('--scan-line-opacity', '0')
    } else {
      root.style.setProperty('--scan-line-opacity', '0.6')
    }

  }, [theme])

  const setTheme = (newTheme: ThemeConfig) => {
    setThemeState(newTheme)
    localStorage.setItem('kronos-theme', JSON.stringify(newTheme))
  }

  const applyPreset = (presetName: keyof typeof themePresets) => {
    const preset = themePresets[presetName]
    setTheme(preset)
  }

  const resetToDefault = () => {
    setTheme(defaultTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyPreset, resetToDefault }}>
      {children}
    </ThemeContext.Provider>
  )
}

