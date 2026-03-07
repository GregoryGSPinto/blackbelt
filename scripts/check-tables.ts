import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '..', '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function main() {
  // PostgREST root returns OpenAPI spec with all public tables
  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  })

  if (!res.ok) {
    console.error(`Failed to fetch schema: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const spec = await res.json()
  const paths = Object.keys(spec.paths || {})
    .map(p => p.replace('/', ''))
    .filter(p => p && !p.startsWith('rpc/'))
    .sort()

  if (paths.length === 0) {
    console.log('NO TABLES FOUND in public schema.')
    console.log('You need to run migrations first.')
  } else {
    console.log(`Found ${paths.length} tables in public schema:`)
    paths.forEach(t => console.log(`  - ${t}`))
  }
}

main().catch(console.error)
