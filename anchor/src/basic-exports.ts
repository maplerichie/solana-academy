// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import SolanaAcademyIDL from '../target/idl/solana_academy.json';
import type { SolanaAcademy } from '../target/types/solana_academy';

// Re-export the generated IDL and type
export { SolanaAcademy, SolanaAcademyIDL };

// The programId is imported from the program IDL.
export const BASIC_PROGRAM_ID = new PublicKey(SolanaAcademyIDL.address);

// This is a helper function to get the Basic Anchor program.
export function getAcademyProgram(provider: AnchorProvider) {
  return new Program(SolanaAcademyIDL as SolanaAcademy, provider);
}

export function getAcademyProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg');
    case 'mainnet-beta':
    default:
      return BASIC_PROGRAM_ID;
  }
}
