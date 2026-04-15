'use server';

import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

// We import the ABI. Next.js will bundle this correctly.
import CONTRACT_ABI from './abi.json';

export interface ScanData {
  id: string;
  quality: number;
  status: string;
  created_at: string;
}

/**
 * Logs a hardware reading synchronously to the Polygon Amoy Testnet (Chain ID 80002).
 * Running as a Next.js Server Action ('use server') to secure the private key.
 * 
 * @param scan The scan object containing id, value, and status
 * @returns The transaction hash if successful, null if failed
 */
export async function logToBlockchain(scan: ScanData): Promise<string | null> {
  try {
    const RPC_URL = process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC;
    const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const PRIVATE_KEY = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;

    if (!RPC_URL || !CONTRACT_ADDRESS || !PRIVATE_KEY) {
      console.warn('[Server/Blockchain] Missing env vars. Skipping chain log.');
      return null;
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL, 80002);
    // Secure wallet creation server-side ONLY.
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    // Call smart contract log function. Assuming it takes (string, uint, string)
    // Modify as per your actual Solidity ABI.
    const tx = await contract.logScan(scan.id, scan.quality, scan.status);
    
    console.info(`[Server/Blockchain] Tx sent for scan ${scan.id}. Hash: ${tx.hash}`);
    
    // Wait for 1 confirmation
    await tx.wait(1);
    console.info(`[Server/Blockchain] Scan ${scan.id} confirmed on Polygon Amoy!`);

    // Let's also definitively update the Supabase 'milk_data' table right here
    // securely using the service role key so we don't have to worry about RLS update rules.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      const serverSupabase = createClient(supabaseUrl, supabaseServiceKey);
      await serverSupabase
        .from('milk_data')
        .update({ tx_hash: tx.hash })
        .eq('id', scan.id);
    }

    return tx.hash;
  } catch (error) {
    console.error('[Server/Blockchain] Critical Error during blockchain execution:', error);
    return null;
  }
}
