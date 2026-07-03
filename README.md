# HR Student Organisation

A unified repository of HR students in Kenya. Built with Next.js, React, and Supabase.

## Setup

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://kbnejhiozoxhrmkzlqnq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Test Accounts

### Super Admin
- **Email:** vomollo101@gmail.com
- **Password:** 12345678

### Students (password: `password123!`)
| Email | Name | Institution |
|-------|------|-------------|
| student1@test.com | Jane Wanjiku | University of Nairobi |
| student2@test.com | Brian Ochieng | Kenyatta University |
| student3@test.com | Mary Akinyi | Strathmore University |
| student4@test.com | Peter Kamau | JKUAT |
| student5@test.com | Grace Muthoni | Kenya Institute of Management |
| student6@test.com | David Kiprop | Kenya Polytechnic University College |

## Deployment

Deploy to Netlify with the included `netlify.toml` configuration.