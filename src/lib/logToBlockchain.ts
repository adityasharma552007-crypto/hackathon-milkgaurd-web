'use server';

import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import CONTRACT_ABI from './abi.json';

export interface ScanData {
  id: string;
  quality: number;
  status: string;
  channelHash?: string; // SHA-256 hex of all 14 AS7343 channel values
  created_at: string;
}

/**
 * Logs an AS7343 hardware reading to the Polygon Amoy Testnet (Chain ID 80002).
 * Includes quality score, status label, and a SHA-256 hash of all 14 channel values.
 *
 * Running as a Next.js Server Action ('use server') to secure the private key.
 */
export async function logToBlockchain(scan: ScanData): Promise<string | null> {
  try {
    const RPC_URL         = process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC;
    const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const PRIVATE_KEY     = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;

    if (!RPC_URL || !CONTRACT_ADDRESS || !PRIVATE_KEY) {
      console.warn('[Blockchain] Missing env vars — skipping chain log.');
      return null;
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL, 80002);
    const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    // Log: scan id, quality score (×100 as uint), status label, channel hash
    // The Solidity function signature expected: logScan(string id, uint quality, string status, string channelHash)
    const qualityBasisPoints = Math.round(scan.quality * 100);
    const channelHash = scan.channelHash ?? '';

    const tx = await contract.logScan(
      scan.id,
      qualityBasisPoints,
      scan.status,
      channelHash
    );

    console.info(`[Blockchain] Tx sent for scan ${scan.id}. Hash: ${tx.hash}`);
    await tx.wait(1);
    console.info(`[Blockchain] Scan ${scan.id} confirmed on Polygon Amoy!`);

    // Persist tx_hash + channel_hash back to milk_data using the service-role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && serviceKey) {
      const serverSupabase = createClient(supabaseUrl, serviceKey);
      await serverSupabase
        .from('milk_data')
        .update({ tx_hash: tx.hash, channel_hash: channelHash || null })
        .eq('id', scan.id);
    }

    return tx.hash;
  } catch (error) {
    console.error('[Blockchain] Critical error during chain execution:', error);
    return null;
  }
}
