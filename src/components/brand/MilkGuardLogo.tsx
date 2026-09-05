'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BRAND_CONFIG } from '@/config/brand'
import { cn } from '@/lib/utils'

export type LogoVariant = 'full' | 'icon' | 'header'
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number

interface MilkGuardLogoProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
  priority?: boolean
  linkToHome?: boolean
  showWordmark?: boolean
  textClassName?: string
  alt?: string
}

const SIZE_MAP: Record<string, { width: number; height: number; imgSize: number }> = {
  xs: { width: 28, height: 28, imgSize: 28 },
  sm: { width: 36, height: 36, imgSize: 36 },
  md: { width: 44, height: 44, imgSize: 44 },
  lg: { width: 64, height: 64, imgSize: 64 },
  xl: { width: 96, height: 96, imgSize: 96 },
  '2xl': { width: 140, height: 140, imgSize: 140 },
}

export function MilkGuardLogo({
  variant = 'header',
  size = 'md',
  className,
  priority = false,
  linkToHome = false,
  showWordmark = true,
  textClassName,
  alt = BRAND_CONFIG.name,
}: MilkGuardLogoProps) {
  const pixelSize = typeof size === 'number' ? size : (SIZE_MAP[size]?.imgSize || 44)

  const content = (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      {variant === 'full' ? (
        // Full official logo badge (emblem + wordmark + tagline)
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: pixelSize, height: pixelSize }}
        >
          <Image
            src={BRAND_CONFIG.assets.logo}
            alt={alt}
            width={pixelSize}
            height={pixelSize}
            className="w-full h-full object-contain filter drop-shadow-sm"
            priority={priority}
          />
        </div>
      ) : variant === 'icon' ? (
        // Pure circular emblem (milk drop, magnifying glass, shield checkmark, sensor)
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: pixelSize, height: pixelSize }}
        >
          <Image
            src={BRAND_CONFIG.assets.logoIcon}
            alt={`${alt} Icon`}
            width={pixelSize}
            height={pixelSize}
            className="w-full h-full object-contain filter drop-shadow-sm"
            priority={priority}
          />
        </div>
      ) : (
        // Header / Horizontal layout: circular emblem + crisp typography
        <>
          <div
            className="relative shrink-0 flex items-center justify-center"
            style={{ width: pixelSize, height: pixelSize }}
          >
            <Image
              src={BRAND_CONFIG.assets.logoIcon}
              alt={`${alt} Icon`}
              width={pixelSize}
              height={pixelSize}
              className="w-full h-full object-contain filter drop-shadow-sm"
              priority={priority}
            />
          </div>
          {showWordmark && (
            <span
              className={cn(
                'font-extrabold text-[#00288e] tracking-tight leading-none',
                pixelSize <= 32 ? 'text-lg' : pixelSize <= 44 ? 'text-xl' : 'text-2xl',
                textClassName
              )}
            >
              {BRAND_CONFIG.name}
            </span>
          )}
        </>
      )}
    </div>
  )

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex items-center group transition-transform active:scale-95">
        {content}
      </Link>
    )
  }

  return content
}
