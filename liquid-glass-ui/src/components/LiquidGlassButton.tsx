import React, { useState, useRef, useEffect } from 'react'

interface LiquidGlassButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
}

const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  href,
  onClick,
  className = '',
  variant = 'secondary',
  disabled = false
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setMousePos({ x, y })
  }

  const baseClasses = `
    relative overflow-hidden transition-all duration-300 ease-out
    backdrop-blur-md border border-white/20
    shadow-lg hover:shadow-xl
    transform hover:-translate-y-0.5
    before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300
    after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:opacity-0 after:transition-opacity after:duration-300
    hover:before:opacity-100 hover:after:opacity-100
  `

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-blue-500/20 to-purple-600/20 
      text-blue-600 hover:text-blue-700
      border-blue-200/30 hover:border-blue-300/50
      shadow-blue-500/10 hover:shadow-blue-500/20
    `,
    secondary: `
      bg-white/10 hover:bg-white/20
      text-gray-600 hover:text-gray-900
      border-gray-200/30 hover:border-gray-300/50
    `,
    ghost: `
      bg-transparent hover:bg-white/10
      text-gray-600 hover:text-gray-900
      border-transparent hover:border-white/20
    `
  }

  const liquidEffect = isHovered ? {
    background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`
  } : {}

  const commonProps = {
    ref: buttonRef,
    className: `${baseClasses} ${variantClasses[variant]} ${className}`,
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onClick: disabled ? undefined : onClick,
    style: {
      ...liquidEffect,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1
    }
  }

  if (href) {
    return (
      <a {...commonProps} href={href}>
        <span className="relative z-10">{children}</span>
        {isHovered && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)`
            }}
          />
        )}
      </a>
    )
  }

  return (
    <button {...commonProps}>
      <span className="relative z-10">{children}</span>
      {isHovered && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)`
          }}
        />
      )}
    </button>
  )
}

export default LiquidGlassButton