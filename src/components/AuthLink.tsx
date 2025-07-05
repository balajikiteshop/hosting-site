'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { ReactNode } from 'react'

interface AuthLinkProps {
  href: string
  children: ReactNode
  className?: string
  requireAuth?: boolean
}

export default function AuthLink({ 
  href, 
  children, 
  className, 
  requireAuth = true 
}: AuthLinkProps) {
  const { user, loading } = useUser()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (requireAuth && !user && !loading) {
      e.preventDefault()
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(href)
      router.push(`/login?returnUrl=${returnUrl}`)
    } else if (!loading) {
      router.push(href)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      disabled={loading}
    >
      {children}
    </button>
  )
}
