import React, { useState, useRef } from 'react'

interface LiquidGlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
  variant?: 'default' | 'featured' | 'subtle'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className = '',
  onClick,
  href,
  variant = 'default',
  rounded = 'xl'
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setMousePos({ x, y })
  }

  const baseClasses = `
    relative overflow-hidden transition-all duration-500 ease-out
    backdrop-blur-xl border border-white/20
    shadow-2xl hover:shadow-3xl
    transform hover:-translate-y-2 hover:scale-[1.02]
    before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500
    after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:opacity-0 after:transition-opacity before:duration-500
    hover:before:opacity-100 hover:after:opacity-100
  `

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md', 
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  }

  const variantClasses = {
    default: `
      bg-white/10 hover:bg-white/15
      border-white/20 hover:border-white/30
      shadow-black/10 hover:shadow-black/20
    `,
    featured: `
      bg-gradient-to-br from-white/20 to-white/5 hover:from-white/25 hover:to-white/10
      border-white/30 hover:border-white/40
      shadow-black/20 hover:shadow-black/30
    `,
    subtle: `
      bg-white/5 hover:bg-white/10
      border-white/10 hover:border-white/20
      shadow-black/5 hover:shadow-black/10
    `
  }

  const liquidEffect = isHovered ? {
    background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)`
  } : {}

  const commonProps = {
    ref: cardRef,
    className: `${baseClasses} ${variantClasses[variant]} ${roundedClasses[rounded]} ${className}`,
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onClick: onClick,
    style: liquidEffect
  }

  const content = (
    <>
      <div className="relative z-10">
        {children}
      </div>
      {isHovered && (
        <div 
          className="absolute inset-0 opacity-40 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`
          }}
        />
      )}
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-30 pointer-events-none" />
      {/* Subtle border highlight */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-20 pointer-events-none" style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent, transparent)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'exclude' }} />
    </>
  )

  if (href) {
    return (
      <a {...commonProps} href={href}>
        {content}
      </a>
    )
  }

  return (
    <div {...commonProps}>
      {content}
    </div>
  )
}

export default LiquidGlassCard