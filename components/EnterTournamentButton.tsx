"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2 } from 'lucide-react';
import { TOURNAMENT_ABI } from '@/lib/contract';
import { getCurrentDayId } from '@/lib/dayId';
import { parseUnits } from 'viem';

const TOURNAMENT_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;
// USDC ERC-20 interface address on ARC Testnet (from official docs: https://docs.arc.network/arc/references/contract-addresses)
const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000') as `0x${string}`;
const ENTRY_FEE = parseUnits('5', 6); // 5 USDC with 6 decimals (USDC ERC-20 interface uses 6 decimals)

// USDC ABI (ERC20 standard - complete for approve)
const USDC_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface EnterTournamentButtonProps {
  onEntered?: () => void;
}

export function EnterTournamentButton({ onEntered }: EnterTournamentButtonProps) {
  const { address, isConnected } = useAccount();
  const [isChecking, setIsChecking] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [hasCalledEnter, setHasCalledEnter] = useState(false);

  const { writeContract: writeUSDC, data: approveHash, isPending: isApproving, error: approveError } = useWriteContract();
  const { writeContract: writeTournament, data: enterHash, isPending: isEntering, error: enterError } = useWriteContract();

  // Handle approval errors
  useEffect(() => {
    if (approveError) {
      console.error('USDC Approval Error:', approveError);
      alert(`Approval failed: ${approveError.message}`);
      setIsChecking(false);
      setNeedsApproval(false);
      setHasCalledEnter(false);
    }
  }, [approveError]);

  // Handle enter tournament errors
  useEffect(() => {
    if (enterError) {
      console.error('Enter Tournament Error:', enterError);
      alert(`Enter tournament failed: ${enterError.message}`);
      setIsChecking(false);
      setNeedsApproval(false);
      setHasCalledEnter(false);
    }
  }, [enterError]);

  const { isLoading: isApprovingTx, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isEnteringTx, isSuccess: isEnterSuccess } = useWaitForTransactionReceipt({
    hash: enterHash,
  });

  // When approval is confirmed, automatically enter tournament
  useEffect(() => {
    if (needsApproval && isApprovalSuccess && !hasCalledEnter && !isEntering && !isEnteringTx) {
      console.log('Approval confirmed, entering tournament...');
      setHasCalledEnter(true);
      
      const dayId = getCurrentDayId();
      try {
        writeTournament({
          address: TOURNAMENT_CONTRACT_ADDRESS,
          abi: TOURNAMENT_ABI,
          functionName: 'enterTournament',
          args: [BigInt(dayId)],
        });
      } catch (error: any) {
        console.error('Error calling enterTournament:', error);
        alert(`Error entering tournament: ${error.message}`);
        setNeedsApproval(false);
        setHasCalledEnter(false);
        setIsChecking(false);
      }
    }
  }, [needsApproval, isApprovalSuccess, hasCalledEnter, isEntering, isEnteringTx, writeTournament]);

  // When enter tournament is successful, call onEntered
  useEffect(() => {
    if (isEnterSuccess) {
      console.log('Successfully entered tournament!');
      onEntered?.();
      setNeedsApproval(false);
      setHasCalledEnter(false);
      setIsChecking(false);
    }
  }, [isEnterSuccess, onEntered]);

  const handleEnterTournament = useCallback(async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!TOURNAMENT_CONTRACT_ADDRESS) {
      alert('Tournament contract not configured');
      return;
    }

    setIsChecking(true);
    setNeedsApproval(false);
    setHasCalledEnter(false);

    try {
      // Step 1: Approve USDC
      console.log('=== USDC Approval Request ===');
      console.log('USDC Address:', USDC_ADDRESS);
      console.log('Tournament Contract:', TOURNAMENT_CONTRACT_ADDRESS);
      console.log('Entry Fee (raw bigint):', ENTRY_FEE.toString());
      console.log('Entry Fee (5 USDC with 6 decimals):', Number(ENTRY_FEE) / 1e6, 'USDC');
      console.log('Entry Fee should be: 5000000 (5 * 10^6)');
      
      if (!USDC_ADDRESS || USDC_ADDRESS === '0x') {
        throw new Error('USDC address not configured');
      }
      
      if (!TOURNAMENT_CONTRACT_ADDRESS || TOURNAMENT_CONTRACT_ADDRESS === '0x') {
        throw new Error('Tournament contract address not configured');
      }
      
      console.log('Calling approve with:');
      console.log('  Spender:', TOURNAMENT_CONTRACT_ADDRESS);
      console.log('  Amount:', ENTRY_FEE.toString());
      console.log('  Amount (USDC):', Number(ENTRY_FEE) / 1e6);
      
      writeUSDC({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [TOURNAMENT_CONTRACT_ADDRESS as `0x${string}`, ENTRY_FEE],
      });

      setNeedsApproval(true);
      console.log('Approval request sent to wallet');
    } catch (error: any) {
      console.error('Error entering tournament:', error);
      alert(`Error: ${error.message || 'Failed to enter tournament'}`);
      setIsChecking(false);
      setNeedsApproval(false);
      setHasCalledEnter(false);
    }
  }, [isConnected, address, writeUSDC]);

  const isLoading = isChecking || isApproving || isApprovingTx || isEntering || isEnteringTx;

  // Show status messages
  const getStatusMessage = () => {
    if (isApproving || isApprovingTx) return 'Approving USDC...';
    if (isEntering || isEnteringTx) return 'Entering Tournament...';
    if (needsApproval && !isApprovalSuccess) return 'Waiting for approval...';
    return 'Enter Tournament (5 USDC)';
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleEnterTournament}
        disabled={!isConnected || isLoading}
        size="lg"
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl px-8 py-6 hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            {getStatusMessage()}
          </>
        ) : (
          <>
            <Trophy className="mr-2 h-6 w-6" />
            Enter Tournament (5 USDC)
          </>
        )}
      </Button>
      
      {isLoading && (
        <div className="text-sm text-yellow-400 font-mono space-y-1">
          {isApproving || isApprovingTx ? (
            <p>⏳ Step 1/2: Approving USDC spending... Check your wallet!</p>
          ) : isEntering || isEnteringTx ? (
            <p>⏳ Step 2/2: Entering tournament... Check your wallet!</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
