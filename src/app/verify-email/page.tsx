'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    if (user.email_confirmed_at) {
      router.push('/dashboard')
      return
    }

    setEmail(user.email || '')
  }

  const handleResendEmail = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Verification email sent! Please check your inbox.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jungle-green-bg to-white px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-jungle-green rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Verify Your Email</h2>
        
        <p className="text-gray-600 mb-6">
          We've sent a verification email to <strong>{email}</strong>. 
          Please check your inbox and click the verification link to activate your account.
        </p>

        {message && (
          <div className={`px-4 py-3 rounded-lg mb-4 ${
            message.includes('Error') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleResendEmail}
          disabled={loading}
          className="w-full bg-jungle-green hover:bg-jungle-green-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </button>

        <p className="text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or click the button above to resend.
        </p>
      </div>
    </div>
  )
}