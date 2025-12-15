'use client'

import React from 'react'

interface DataShapeProps {
  className?: string
  variant?: 'dots' | 'lines' | 'grid' | 'waves' | 'binary'
  animate?: boolean
}

export const DataShape: React.FC<DataShapeProps> = ({ 
  className = '', 
  variant = 'dots',
  animate = false 
}) => {
  const baseClasses = `absolute pointer-events-none ${animate ? 'animate-pulse-cyber' : ''} ${className}`

  switch (variant) {
    case 'dots':
      return (
        <div className={baseClasses}>
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-cyber-green/30">
            {Array.from({ length: 25 }, (_, i) => {
              const x = (i % 5) * 20 + 10
              const y = Math.floor(i / 5) * 20 + 10
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="currentColor"
                  className={animate ? 'animate-pulse' : ''}
                />
              )
            })}
          </svg>
        </div>
      )

    case 'lines':
      return (
        <div className={baseClasses}>
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-cyber-green/30">
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1="0"
                y1={i * 20 + 10}
                x2="100"
                y2={i * 20 + 10}
                stroke="currentColor"
                strokeWidth="1"
                className={animate ? 'animate-pulse' : ''}
              />
            ))}
          </svg>
        </div>
      )

    case 'grid':
      return (
        <div className={baseClasses}>
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-cyber-green/20">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      )

    case 'waves':
      return (
        <div className={baseClasses}>
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-cyber-blue/30">
            <path
              d="M0,50 Q25,25 50,50 T100,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={animate ? 'animate-pulse' : ''}
            />
            <path
              d="M0,60 Q25,35 50,60 T100,60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className={animate ? 'animate-pulse' : ''}
            />
          </svg>
        </div>
      )

    case 'binary':
      return (
        <div className={`${baseClasses} font-mono text-xs text-cyber-green/20`}>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }, (_, i) => (
              <span key={i} className={animate ? 'animate-pulse' : ''}>
                {Math.random() > 0.5 ? '1' : '0'}
              </span>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}

export const CyberFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-green"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-green"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-green"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-green"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export const GlitchText: React.FC<{ 
  text: string
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}> = ({ text, className = '', intensity = 'medium' }) => {
  const glitchClass = intensity === 'high' ? 'animate-glitch-1' : 
                     intensity === 'medium' ? 'animate-pulse-cyber' : 
                     'animate-pulse'

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span 
        className={`absolute top-0 left-0 text-cyber-blue ${glitchClass}`}
        style={{ transform: 'translate(-1px, 1px)' }}
      >
        {text}
      </span>
      <span 
        className={`absolute top-0 left-0 text-cyber-purple ${glitchClass}`}
        style={{ transform: 'translate(1px, -1px)' }}
      >
        {text}
      </span>
    </span>
  )
}

export const CyberButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  disabled?: boolean
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseClasses = "relative px-6 py-3 font-mono text-sm tracking-wider uppercase transition-all duration-300 overflow-hidden"
  
  const variantClasses = {
    primary: "bg-cyber-green text-background border border-cyber-green hover:bg-transparent hover:text-cyber-green hover:shadow-cyber",
    secondary: "bg-transparent text-cyber-green border border-cyber-green hover:bg-cyber-green/10 hover:shadow-cyber",
    outline: "bg-transparent text-cyber-blue border border-cyber-blue hover:bg-cyber-blue/10 hover:text-cyber-blue hover:shadow-cyber"
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-green/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-500"></div>
    </button>
  )
}

