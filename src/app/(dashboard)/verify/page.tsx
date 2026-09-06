import { createClient } from "@/lib/supabase/server"
import { verifyPublicScan } from "@/lib/supabase/masterScanService"
import { VerifyClient } from "./VerifyClient"

export default async function VerifyPage({
  searchParams
}: {
  searchParams?: { tx?: string; scan_id?: string; query?: string }
}) {
  const supabase = createClient()
  const lookupQuery = (searchParams?.query || searchParams?.scan_id || searchParams?.tx || '').trim()

  let verificationResult: any = null
  if (lookupQuery) {
    try {
      verificationResult = await verifyPublicScan(lookupQuery)
    } catch (err: any) {
      verificationResult = { verified: false, reason: 'error', error: err.message }
    }
  }

  // Fetch recent scans that have tx_hash recorded on-chain
  const { data: onChainScans } = await supabase
    .from('scans')
    .select('*, vendors(name)')
    .not('tx_hash', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch total on-chain count
  const { count: totalOnChain } = await supabase
    .from('scans')
    .select('id', { count: 'exact', head: true })
    .not('tx_hash', 'is', null)

  return (
    <VerifyClient
      lookupQuery={lookupQuery}
      verificationResult={verificationResult}
      onChainScans={onChainScans}
      totalOnChain={totalOnChain}
    />
  )
}
