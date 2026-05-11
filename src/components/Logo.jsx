export function LogoMark({ size = 40, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#0b0d10"/>
      <rect x="14" y="16" width="6" height="32" rx="1.5" fill="#fff"/>
      <path d="M28 16 L46 48" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
      <path d="M46 16 L28 48" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  )
}

export function LogoFull({ size = 40 }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      <span className="font-bold tracking-tight text-ink" style={{ fontSize: size * 0.6, letterSpacing: '-0.035em' }}>invoxa</span>
    </div>
  )
}

export function LogoWhite({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#fff"/>
      <rect x="14" y="16" width="6" height="32" rx="1.5" fill="#0b0d10"/>
      <path d="M28 16 L46 48" stroke="#0b0d10" strokeWidth="6" strokeLinecap="round"/>
      <path d="M46 16 L28 48" stroke="#0b0d10" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  )
}
