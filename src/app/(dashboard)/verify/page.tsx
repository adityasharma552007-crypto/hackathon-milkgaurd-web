import { verifyPublicScan, getVerifiedOnChainCount, getRecentOnChainScans } from "@/lib/supabase/masterScanService"
import { VerifyClient } from "./VerifyClient"

export default async function VerifyPage({
  searchParams
}: {
  searchParams?: { tx?: string; scan_id?: string; query?: string }
}) {
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
  const onChainScans = await getRecentOnChainScans(10)

  // Fetch total on-chain count
  const totalOnChain = await getVerifiedOnChainCount()

  return (
    <VerifyClient
      lookupQuery={lookupQuery}
      verificationResult={verificationResult}
      onChainScans={onChainScans}
      totalOnChain={totalOnChain}
    />
  )
}
