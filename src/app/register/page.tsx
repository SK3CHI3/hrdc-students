'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Institution {
  id: string
  name: string
  category: 'university' | 'college'
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    institutionId: '',
    referralCode: '',
    registrationNumber: '',
    linkedinUrl: '',
  })
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [institutionSearch, setInstitutionSearch] = useState('')
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchInstitutions()
  }, [])

  const fetchInstitutions = async () => {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('name')
    
    if (!error && data) {
      setInstitutions(data)
      setFilteredInstitutions(data)
    }
  }

  const handleInstitutionSearch = (value: string) => {
    setInstitutionSearch(value)
    setShowSuggestions(true)
    
    if (value.trim() === '') {
      setFilteredInstitutions(institutions)
    } else {
      const filtered = institutions.filter(inst =>
        inst.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredInstitutions(filtered)
    }
  }

  const handleSelectInstitution = (inst: Institution) => {
    setFormData(prev => ({ ...prev, institutionId: inst.id }))
    setInstitutionSearch(inst.name)
    setShowSuggestions(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Create student profile using API route (bypasses RLS)
      const profileResponse = await fetch('/api/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          fullName: formData.fullName,
          email: formData.email,
          institutionId: formData.institutionId || null,
          referralCode: formData.referralCode || null,
          registrationNumber: formData.registrationNumber || null,
          linkedinUrl: formData.linkedinUrl || null,
        }),
      })

      const profileResult = await profileResponse.json()

      if (!profileResponse.ok) {
        setError('Failed to create profile: ' + profileResult.error)
        setLoading(false)
        return
      }

      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jungle-green-bg to-white px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-jungle-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification email to <strong>{formData.email}</strong>. 
            Please check your inbox and click the verification link to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block bg-jungle-green hover:bg-jungle-green-dark text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jungle-green-bg to-white px-4 py-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-jungle-green-dark">
            HR Student Organisation
          </h1>
          <p className="text-gray-600 mt-2">Join the Unified Repository of HR Students in Kenya</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none transition"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="relative">
              <label htmlFor="institutionSearch" className="block text-sm font-medium text-gray-700 mb-1">
                Institution <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="institutionSearch"
                  type="text"
                  value={institutionSearch}
                  onChange={(e) => handleInstitutionSearch(e.target.value)}
                  onFocus={() => {
                    setShowSuggestions(true)
                    setFilteredInstitutions(institutions)
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  required
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none transition"
                  placeholder="Select or search institutions..."
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {filteredInstitutions.length > 0 ? (
                    filteredInstitutions.map((inst) => (
                      <div
                        key={inst.id}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelectInstitution(inst)
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-jungle-green-bg transition cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          formData.institutionId === inst.id ? 'bg-jungle-green-bg' : ''
                        }`}
                      >
                        <span className="font-medium text-gray-800">{inst.name}</span>
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                          {inst.category}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No institutions found
                    </div>
                  )}
                </div>
              )}
              {formData.institutionId && (
                <p className="text-sm text-jungle-green mt-1">
                  ✓ Selected: {institutionSearch}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-500 mb-4">Optional Information</p>
            </div>

            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code
              </label>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                value={formData.referralCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none transition"
                placeholder="Enter referral code if you have one"
              />
            </div>

            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none transition"
                placeholder="Your student registration number"
              />
            </div>

            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none transition"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-jungle-green hover:bg-jungle-green-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-jungle-green hover:text-jungle-green-dark font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}