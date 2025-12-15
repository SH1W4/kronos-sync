'use client'

import React, { useState } from 'react'
import { useTheme, themePresets, ThemeConfig } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const ColorPicker: React.FC<{
  label: string
  value: string
  onChange: (value: string) => void
}> = ({ label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-mono text-cyber-green">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 border border-cyber-green/30 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-background/50 border border-cyber-green/30 text-cyber-green font-mono text-sm"
          placeholder="#00FF88"
        />
      </div>
    </div>
  )
}

const SliderControl: React.FC<{
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}> = ({ label, value, min, max, step, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-mono text-cyber-green">{label}</label>
        <span className="text-sm font-mono text-cyber-green/70">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-cyber-green/20 appearance-none cursor-pointer slider"
      />
    </div>
  )
}

const SelectControl: React.FC<{
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}> = ({ label, value, options, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-mono text-cyber-green">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-background/50 border border-cyber-green/30 text-cyber-green font-mono text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-background">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const ToggleControl: React.FC<{
  label: string
  value: boolean
  onChange: (value: boolean) => void
}> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-mono text-cyber-green">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 border border-cyber-green/30 relative transition-all duration-300 ${
          value ? 'bg-cyber-green/20' : 'bg-transparent'
        }`}
      >
        <div
          className={`w-4 h-4 bg-cyber-green transition-transform duration-300 absolute top-0.5 ${
            value ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export const ThemeCustomizer: React.FC = () => {
  const { theme, setTheme, applyPreset, resetToDefault } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme({ ...theme, ...updates })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          PERSONALIZAR
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background border border-cyber-green/30">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-cyber-green tracking-wider">
            &gt; PERSONALIZAÇÃO_DE_TEMA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Presets */}
          <div className="space-y-4">
            <h3 className="text-lg font-mono text-cyber-green tracking-wider">&gt; PRESETS</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(themePresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key as keyof typeof themePresets)}
                  className="p-3 border border-cyber-green/30 hover:bg-cyber-green/10 transition-all duration-300 text-left"
                >
                  <div className="font-mono text-sm text-cyber-green mb-2">
                    {key.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className="flex space-x-2">
                    <div 
                      className="w-4 h-4 border border-cyber-green/30"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <div 
                      className="w-4 h-4 border border-cyber-green/30"
                      style={{ backgroundColor: preset.secondaryColor }}
                    />
                    <div 
                      className="w-4 h-4 border border-cyber-green/30"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-mono text-cyber-green tracking-wider">&gt; CORES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker
                label="Cor Primária"
                value={theme.primaryColor}
                onChange={(value) => updateTheme({ primaryColor: value })}
              />
              <ColorPicker
                label="Cor Secundária"
                value={theme.secondaryColor}
                onChange={(value) => updateTheme({ secondaryColor: value })}
              />
              <ColorPicker
                label="Cor de Destaque"
                value={theme.accentColor}
                onChange={(value) => updateTheme({ accentColor: value })}
              />
              <ColorPicker
                label="Cor de Fundo"
                value={theme.backgroundColor}
                onChange={(value) => updateTheme({ backgroundColor: value })}
              />
            </div>
          </div>

          {/* Cyber Effects */}
          <div className="space-y-4">
            <h3 className="text-lg font-mono text-cyber-green tracking-wider">&gt; EFEITOS_CYBER</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectControl
                label="Intensidade do Glitch"
                value={theme.glitchIntensity}
                options={[
                  { value: 'off', label: 'Desligado' },
                  { value: 'low', label: 'Baixo' },
                  { value: 'medium', label: 'Médio' },
                  { value: 'high', label: 'Alto' }
                ]}
                onChange={(value) => updateTheme({ glitchIntensity: value as any })}
              />
              <SelectControl
                label="Velocidade do Pulse"
                value={theme.pulseSpeed}
                options={[
                  { value: 'slow', label: 'Lento' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'fast', label: 'Rápido' }
                ]}
                onChange={(value) => updateTheme({ pulseSpeed: value as any })}
              />
              <ToggleControl
                label="Linhas de Varredura"
                value={theme.scanLinesEnabled}
                onChange={(value) => updateTheme({ scanLinesEnabled: value })}
              />
              <SliderControl
                label="Opacidade da Grade"
                value={theme.gridOpacity}
                min={0}
                max={1}
                step={0.1}
                onChange={(value) => updateTheme({ gridOpacity: value })}
              />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h3 className="text-lg font-mono text-cyber-green tracking-wider">&gt; TIPOGRAFIA</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectControl
                label="Família da Fonte"
                value={theme.fontFamily}
                options={[
                  { value: 'jetbrains', label: 'JetBrains Mono' },
                  { value: 'orbitron', label: 'Orbitron' },
                  { value: 'inter', label: 'Inter' }
                ]}
                onChange={(value) => updateTheme({ fontFamily: value as any })}
              />
              <SelectControl
                label="Tamanho da Fonte"
                value={theme.fontSize}
                options={[
                  { value: 'small', label: 'Pequeno' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'large', label: 'Grande' }
                ]}
                onChange={(value) => updateTheme({ fontSize: value as any })}
              />
              <SelectControl
                label="Espaçamento"
                value={theme.letterSpacing}
                options={[
                  { value: 'tight', label: 'Apertado' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'wide', label: 'Largo' }
                ]}
                onChange={(value) => updateTheme({ letterSpacing: value as any })}
              />
            </div>
          </div>

          {/* Layout & Animations */}
          <div className="space-y-4">
            <h3 className="text-lg font-mono text-cyber-green tracking-wider">&gt; LAYOUT_E_ANIMAÇÕES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectControl
                label="Raio da Borda"
                value={theme.borderRadius}
                options={[
                  { value: 'none', label: 'Nenhum' },
                  { value: 'small', label: 'Pequeno' },
                  { value: 'medium', label: 'Médio' }
                ]}
                onChange={(value) => updateTheme({ borderRadius: value as any })}
              />
              <SelectControl
                label="Intensidade da Sombra"
                value={theme.shadowIntensity}
                options={[
                  { value: 'none', label: 'Nenhuma' },
                  { value: 'subtle', label: 'Sutil' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'intense', label: 'Intensa' }
                ]}
                onChange={(value) => updateTheme({ shadowIntensity: value as any })}
              />
              <ToggleControl
                label="Animações Habilitadas"
                value={theme.animationsEnabled}
                onChange={(value) => updateTheme({ animationsEnabled: value })}
              />
              <SelectControl
                label="Velocidade de Transição"
                value={theme.transitionSpeed}
                options={[
                  { value: 'slow', label: 'Lenta' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'fast', label: 'Rápida' }
                ]}
                onChange={(value) => updateTheme({ transitionSpeed: value as any })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-cyber-green/30">
            <Button
              onClick={resetToDefault}
              variant="outline"
              className="border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10"
            >
              RESETAR PADRÃO
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-cyber-green text-background hover:bg-cyber-green/80"
            >
              APLICAR TEMA
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

