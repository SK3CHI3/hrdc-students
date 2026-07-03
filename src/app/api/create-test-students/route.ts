import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Get institution IDs
    const { data: institutions } = await supabaseAdmin
      .from('institutions')
      .select('id, name')
      .limit(4)

    if (!institutions || institutions.length < 4) {
      return NextResponse.json({ error: 'Not enough institutions' }, { status: 400 })
    }

    const testStudents = [
      {
        email: 'student1@test.com',
        password: 'password123!',
        full_name: 'Jane Wanjiku',
        institution_id: institutions[0].id,
      },
      {
        email: 'student2@test.com',
        password: 'password123!',
        full_name: 'Brian Ochieng',
        institution_id: institutions[1].id,
      },
      {
        email: 'student3@test.com',
        password: 'password123!',
        full_name: 'Mary Akinyi',
        institution_id: institutions[2].id,
      },
      {
        email: 'student4@test.com',
        password: 'password123!',
        full_name: 'Peter Kamau',
        institution_id: institutions[3].id,
      },
    ]

    const results = []

    for (const student of testStudents) {
      // Create auth user
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
        // Create student profile
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