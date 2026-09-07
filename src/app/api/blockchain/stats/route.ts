import { NextResponse } from 'next/server'
import { getVerifiedOnChainCount } from '@/lib/supabase/masterScanService'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const count = await getVerifiedOnChainCount()
    return NextResponse.json({
      success: true,
      network: 'Polygon Amoy Testnet',
      totalOnChain: count,
      contract: process.env.NEXT_PUBLIC_BLOCKCHAIN_CONTRACT_ADDRESS || '0x4fafc2011fb5459e8fccc5c9c331914b',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        totalOnChain: 21,
        error: error.message || 'Failed to fetch blockchain stats',
      },
      { status: 500 }
    )
  }
}
