interface AvatarProps {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Avatar = ({ initials, size = 'md', className = '' }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm'
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 border border-zinc-200 flex items-center justify-center font-medium text-zinc-600 shadow-sm ${className}`}
    >
      {initials}
    </div>
  )
}

