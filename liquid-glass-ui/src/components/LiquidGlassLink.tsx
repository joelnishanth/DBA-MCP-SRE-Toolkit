import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

interface LiquidGlassLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

const LiquidGlassLink: React.FC<LiquidGlassLinkProps> = ({
  to,
  children,
  className = '',
  variant = 'secondary'
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const linkRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!linkRef.current) return
    
    const rect = linkRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setMousePos({ x, y })
  }

  const baseClasses = `
    relative overflow-hidden transition-all duration-300 ease-out
    backdrop-blur-sm border border-white/20 rounded-full
    shadow-md hover:shadow-lg
    transform hover:-translate-y-0.5 hover:scale-105
    px-3 py-1 text-sm font-medium
    before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300
    after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:opacity-0 after:transition-opacity after:duration-300
    hover:before:opacity-100 hover:after:opacity-100
  `

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-blue-500/30 to-purple-600/30 
      text-blue-600 hover:text-blue-700 font-semibold
      border-blue-200/40 hover:border-blue-300/60
      shadow-blue-500/20 hover:shadow-blue-500/30
    `,
    secondary: `
      bg-white/15 hover:bg-white/25
      text-gray-600 hover:text-gray-900
      border-gray-200/30 hover:border-gray-300/50
    `,
    ghost: `
      bg-transparent hover:bg-white/15
      text-gray-600 hover:text-gray-900
      border-transparent hover:border-white/30
    `
  }

  return (
    <Link
      ref={linkRef}
      to={to}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10">{children}</span>
      {isHovered && (
        <div 
          className="absolute inset-0 opacity-60 transition-opacity duration-300 rounded-full"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`
          }}
        />
      )}
    </Link>
  )
}

export default LiquidGlassLink