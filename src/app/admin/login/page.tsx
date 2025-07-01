'use client'

import { Suspense } from 'react'
import AdminLoginForm from './AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
