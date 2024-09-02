// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import type { SolanaAcademy } from '../target/types/solana_academy';
import { IDL as SolanaAcademyIDL } from '../target/types/solana_academy';

// Re-export the generated IDL and type
export { SolanaAcademy, SolanaAcademyIDL };

// The programId is imported from the program IDL.
export const BASIC_PROGRAM_ID = new PublicKey(SolanaAcademyIDL.address);

// This is a helper function to get the Basic Anchor program.
export function getBasicProgram(provider: AnchorProvider) {
  return new Program(SolanaAcademyIDL as SolanaAcademy, provider);
}
