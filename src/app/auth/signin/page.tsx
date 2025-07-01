'use client';

import { useState } from 'react'
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from 'next/navigation'
import Image from "next/image"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Check if Google OAuth credentials are configured
      if (!process.env.NEXT_PUBLIC_GOOGLE_ENABLED) {
        setError('Google sign-in is not configured. Please try again later.')
        return
      }
      
      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
        prompt: 'select_account' // Always show account selector
      })

      if (result?.error) {
        console.error('Sign in error:', result.error)
        if (result.error === 'Configuration') {
          setError('Authentication service is temporarily unavailable. Please try again later.')
        } else {
          setError('Failed to sign in with Google. Please try again.')
        }
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      console.error('Unexpected sign in error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
              ) : (
                <>
                  <Image
                    src="/google.svg"
                    alt="Google logo"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Sign in with Google
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
