import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const collegeStudents = [
      {
        email: 'student5@test.com',
        password: 'password123!',
        full_name: 'Grace Muthoni',
        institution_id: 'c6f301fc-62f8-49f9-9c76-cf2d78ca735e', // Kenya Institute of Management
      },
      {
        email: 'student6@test.com',
        password: 'password123!',
        full_name: 'David Kiprop',
        institution_id: 'c4f2b8d7-6aaf-4e1b-90ec-f5fb04b45c00', // Kenya Polytechnic University College
      },
    ]

    const results = []

    for (const student of collegeStudents) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: student.email,
        password: student.password,
        email_confirm: true,
        user_metadata: { full_name: student.full_name },
      })

      if (authError) {
        results.push({ email: student.email, error: authError.message })
        continue
      }

      if (authData.user) {
        const { error: profileError } = await supabaseAdmin
          .from('students')
          .insert({
            id: authData.user.id,
            full_name: student.full_name,
            email: student.email,
            institution_id: student.institution_id,
          })

        if (profileError) {
          results.push({ email: student.email, error: profileError.message })
        } else {
          results.push({ email: student.email, success: true })
        }
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}