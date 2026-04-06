/**
 * PageTitle Component
 *
 * Accessible h1 heading component with consistent styling.
 * Follows SEO best practices for heading hierarchy.
 *
 * SEO Best Practices:
 * - Only ONE h1 per page (the main topic)
 * - Include primary keyword naturally
 * - Keep under 60 characters when possible
 * - Use h2, h3 for subsections
 */

import { cn } from '@/lib/utils'
import React from 'react'

interface PageTitleProps {
  /** The title text */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Custom styling */
  style?: React.CSSProperties
  /** Whether this is the main page title (h1) or subsection (h2, h3) */
  as?: 'h1' | 'h2' | 'h3'
}

export function PageTitle({
  children,
  className,
  style,
  as = 'h1',
}: PageTitleProps) {
  const Component = as

  const baseStyles = cn(
    'font-bold text-[#1A6B4A] tracking-tighter',
    as === 'h1' && 'text-2xl uppercase mb-2',
    as === 'h2' && 'text-xl uppercase mb-3',
    as === 'h3' && 'text-lg mb-2',
    className
  )

  return (
    <Component className={baseStyles} style={style}>
      {children}
    </Component>
  )
}

/**
 * PageSubtitle Component
 *
 * Secondary heading for page descriptions.
 * Should complement the h1 with additional context.
 */
interface PageSubtitleProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function PageSubtitle({ children, className, style }: PageSubtitleProps) {
  return (
    <p
      className={cn(
        'text-slate-400 text-sm font-bold uppercase tracking-widest',
        className
      )}
      style={style}
    >
      {children}
    </p>
  )
}

/**
 * SectionTitle Component
 *
 * For section headings within a page (h2 level).
 * Use to divide content into scannable sections.
 */
interface SectionTitleProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionTitle({ children, className, icon, as = 'h2' }: SectionTitleProps) {
  const Component = as

  return (
    <Component className={cn('text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2', className)}>
      {icon}
      {children}
    </Component>
  )
}
