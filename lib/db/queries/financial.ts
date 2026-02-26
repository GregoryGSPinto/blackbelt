import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']

interface PaymentHistoryOpts {
  from?: string
  to?: string
  status?: string
  page?: number
  limit?: number
}

export async function getPlans(client: Client, academyId: string) {
  return client
    .from('plans')
    .select('*')
    .eq('academy_id', academyId)
    .eq('active', true)
    .order('price_cents')
}

export async function getSubscription(client: Client, membershipId: string) {
  return client
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('membership_id', membershipId)
    .eq('status', 'active')
    .single()
}

export async function createInvoice(client: Client, data: InvoiceInsert) {
  return client
    .from('invoices')
    .insert(data)
    .select()
    .single()
}

export async function recordPayment(client: Client, data: PaymentInsert) {
  return client
    .from('payments')
    .insert(data)
    .select()
    .single()
}

export async function getPaymentHistory(
  client: Client,
  academyId: string,
  opts: PaymentHistoryOpts = {},
) {
  const { from, to, status, page = 1, limit = 50 } = opts
  const offset = (page - 1) * limit

  let query = client
    .from('invoices')
    .select('*, payments(*)', { count: 'exact' })
    .eq('academy_id', academyId)

  if (from) {
    query = query.gte('due_date', from)
  }

  if (to) {
    query = query.lte('due_date', to)
  }

  if (status) {
    query = query.eq('status', status)
  }

  return query
    .range(offset, offset + limit - 1)
    .order('due_date', { ascending: false })
}
