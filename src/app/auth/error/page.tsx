'use client'

import { Suspense } from 'react'
import AuthErrorContent from './AuthErrorContent'

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
