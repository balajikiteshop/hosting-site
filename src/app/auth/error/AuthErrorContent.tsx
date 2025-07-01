'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    // Log the error for debugging
    if (error) {
      console.error('Auth error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error === 'Configuration' && 'Server configuration error'}
                  {error === 'AccessDenied' && 'Access denied'}
                  {error === 'Verification' && 'Verification error'}
                  {!error && 'An error occurred during authentication'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {error === 'Configuration' && 'There is a problem with the server configuration. Please contact support.'}
                    {error === 'AccessDenied' && 'You do not have permission to access this resource.'}
                    {error === 'Verification' && 'Unable to verify your credentials.'}
                    {!error && 'Please try again or contact support if the problem persists.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
