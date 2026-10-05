import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ status: 'ok', active: true, timestamp: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to connect to Supabase' },
      { status: 500 }
    )
  }
}
