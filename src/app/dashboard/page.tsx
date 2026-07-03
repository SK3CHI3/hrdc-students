'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  full_name: string
  email: string
  unique_student_code: string
  institution_id: string
  referral_code: string
  registration_number: string
  linkedin_url: string
  email_verified: boolean
  institutions?: {
    name: string
    category: string
  }
}

export default function DashboardPage() {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
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

    // Check if email is verified
    if (!user.email_confirmed_at) {
      router.push('/verify-email')
      return
    }

    // Fetch student profile
    const { data: studentData, error } = await supabase
      .from('students')
      .select(`
        *,
        institutions (
          name,
          category
        )
      `)
      .eq('id', user.id)
      .single()

    if (error || !studentData) {
      console.error('Error fetching student data:', error)
      router.push('/login')
      return
    }

    setStudent(studentData)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jungle-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-jungle-green-dark">HR Student Organisation</h1>
            <p className="text-sm text-gray-600">Student Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-jungle-green to-jungle-green-dark rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome, {student.full_name}!</h2>
          <p className="text-jungle-green-bg">Your unique student code is ready</p>
        </div>

        {/* Student Code Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Unique Student Code</h3>
          <div className="bg-jungle-green-bg border-2 border-jungle-green rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-jungle-green-dark tracking-wider">
              {student.unique_student_code}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Use this code for all official HR Student Organisation communications
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-800">{student.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-800">{student.email}</p>
              </div>
              {student.registration_number && (
                <div>
                  <p className="text-sm text-gray-600">Registration Number</p>
                  <p className="font-medium text-gray-800">{student.registration_number}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h3>
            <div className="space-y-3">
              {student.institutions && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Institution</p>
                    <p className="font-medium text-gray-800">{student.institutions.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium text-gray-800 capitalize">{student.institutions.category}</p>
                  </div>
                </>
              )}
              {student.referral_code && (
                <div>
                  <p className="text-sm text-gray-600">Referral Code</p>
                  <p className="font-medium text-gray-800">{student.referral_code}</p>
                </div>
              )}
              {student.linkedin_url && (
                <div>
                  <p className="text-sm text-gray-600">LinkedIn Profile</p>
                  <a
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-jungle-green hover:text-jungle-green-dark font-medium"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}