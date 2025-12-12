"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2, AlertCircle } from 'lucide-react';
import { TOURNAMENT_ABI, getDayInfo, hasEntered } from '@/lib/contract';
import { getCurrentDayId } from '@/lib/dayId';
import { parseUnits, formatUnits } from 'viem';
import { useNotificationModal } from '@/components/ui/notification-modal';

const TOURNAMENT_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;
// USDC ERC-20 interface address on ARC Testnet (from official docs: https://docs.arc.network/arc/references/contract-addresses)
const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000') as `0x${string}`;
const ENTRY_FEE = parseUnits('5', 6); // 5 USDC with 6 decimals (USDC ERC-20 interface uses 6 decimals)

// USDC ABI (ERC20 standard - complete for approve, allowance, and balanceOf)
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
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface EnterTournamentButtonProps {
  onEntered?: () => void;
}

const ARC_TESTNET_CHAIN_ID = 5042002;

export function EnterTournamentButton({ onEntered }: EnterTournamentButtonProps) {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isChecking, setIsChecking] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [hasCalledEnter, setHasCalledEnter] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const { showNotification, Modal } = useNotificationModal();

  const { writeContract: writeUSDC, data: approveHash, isPending: isApproving, error: approveError } = useWriteContract();
  const { writeContract: writeTournament, data: enterHash, isPending: isEntering, error: enterError } = useWriteContract();

  // Check USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && chainId === ARC_TESTNET_CHAIN_ID,
    },
  });

  // Check USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address && TOURNAMENT_CONTRACT_ADDRESS ? [address, TOURNAMENT_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address && !!TOURNAMENT_CONTRACT_ADDRESS && isConnected && chainId === ARC_TESTNET_CHAIN_ID,
    },
  });

  // Check if user is on correct network
  useEffect(() => {
    if (isConnected && chainId !== ARC_TESTNET_CHAIN_ID) {
      setNetworkError(`Please switch to ARC Testnet (Chain ID: ${ARC_TESTNET_CHAIN_ID}). Current: ${chain?.name || `Chain ID ${chainId}`}`);
    } else {
      setNetworkError(null);
    }
  }, [isConnected, chainId, chain]);

  // Handle approval errors
  useEffect(() => {
    if (approveError) {
      console.error('USDC Approval Error:', approveError);
      
      // Extract more detailed error information
      let errorMessage = approveError.message || 'Unknown error';
      let errorDetails = '';
      
      // Check for specific error types
      if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
        errorMessage = 'Insufficient USDC balance. You need at least 5 USDC.';
        errorDetails = 'Get test USDC at: https://easyfaucetarc.xyz/';
      } else if (errorMessage.includes('network') || errorMessage.includes('chain')) {
        errorMessage = 'Network error. Please ensure you are connected to ARC Testnet.';
        errorDetails = 'Check your wallet network settings.';
      } else if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
        errorMessage = 'Transaction failed on blockchain';
        errorDetails = 'This may be due to insufficient allowance or contract error.';
      }
      
      showNotification({
        type: 'error',
        title: 'Approval Failed',
        message: errorMessage,
        details: errorDetails,
      });
      setIsChecking(false);
      setNeedsApproval(false);
      setHasCalledEnter(false);
    }
  }, [approveError, showNotification]);

  // Handle enter tournament errors
  useEffect(() => {
    if (enterError) {
      console.error('Enter Tournament Error:', enterError);
      
      // Extract more detailed error information
      let errorMessage = enterError.message || 'Unknown error';
      let errorDetails = '';
      
      // Check for specific error types
      if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (errorMessage.includes('Already entered') || errorMessage.includes('already entered')) {
        errorMessage = 'You have already entered today\'s tournament';
        errorDetails = 'You can only enter once per day.';
      } else if (errorMessage.includes('Day already finalized') || errorMessage.includes('already finalized')) {
        errorMessage = 'Today\'s tournament has already ended';
        errorDetails = 'Please wait for tomorrow\'s tournament.';
      } else if (errorMessage.includes('USDC transfer failed') || errorMessage.includes('transferFrom') || errorMessage.includes('transfer failed')) {
        errorMessage = 'USDC transfer failed';
        errorDetails = 'Please check:\n- Your USDC balance (need at least 5 USDC)\n- Approval was successful\n- You have enough gas/USDC for fees\n\nGet test USDC at: https://easyfaucetarc.xyz/';
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance') || errorMessage.includes('insufficient')) {
        errorMessage = 'Insufficient USDC balance';
        errorDetails = 'You need at least 5 USDC to enter.\nGet test USDC at: https://easyfaucetarc.xyz/';
      } else if (errorMessage.includes('network') || errorMessage.includes('chain')) {
        errorMessage = 'Network error. Please ensure you are connected to ARC Testnet.';
        errorDetails = 'Check your wallet network settings.';
      } else if (errorMessage.includes('revert') || errorMessage.includes('execution reverted') || errorMessage.includes('reverted')) {
        errorMessage = 'Transaction failed on blockchain';
        errorDetails = 'The transaction was reverted. Common causes:\n- Already entered today\n- Day already finalized\n- Insufficient USDC balance\n- Approval not completed\n\nCheck the transaction on ArcScan for details.';
      }
      
      showNotification({
        type: 'error',
        title: 'Enter Tournament Failed',
        message: errorMessage,
        details: errorDetails,
      });
      setIsChecking(false);
      setNeedsApproval(false);
      setHasCalledEnter(false);
    }
  }, [enterError, showNotification]);

  const { isLoading: isApprovingTx, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isEnteringTx, isSuccess: isEnterSuccess } = useWaitForTransactionReceipt({
    hash: enterHash,
  });

  // When approval is confirmed, verify allowance and then enter tournament
  useEffect(() => {
    // Prevent multiple executions with a ref guard
    if (needsApproval && isApprovalSuccess && !hasCalledEnter && !isEntering && !isEnteringTx) {
      console.log('✅ Approval transaction confirmed, verifying allowance before entering tournament...');
      
      // Set flag immediately to prevent duplicate calls
      setHasCalledEnter(true);
      
      // Refetch allowance to ensure it's updated
      refetchAllowance().then(async () => {
        // Small delay to ensure blockchain state is updated
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          // Refetch again to get the latest allowance
          const { data: latestAllowance } = await refetchAllowance();
          const currentAllowance = latestAllowance as bigint | undefined;
          
          console.log('📊 Allowance Check:');
          console.log('  Current allowance:', currentAllowance ? formatUnits(currentAllowance, 6) : '0', 'USDC');
          console.log('  Required:', formatUnits(ENTRY_FEE, 6), 'USDC');
          console.log('  Allowance (raw):', currentAllowance?.toString() || '0');
          console.log('  Required (raw):', ENTRY_FEE.toString());
          
          if (!currentAllowance || currentAllowance < ENTRY_FEE) {
            console.error('❌ Allowance not sufficient!');
            showNotification({
              type: 'warning',
              title: 'Allowance Not Sufficient',
              message: 'The USDC allowance is not sufficient yet.',
              details: `Current: ${currentAllowance ? formatUnits(currentAllowance, 6) : '0'} USDC\nRequired: ${formatUnits(ENTRY_FEE, 6)} USDC\n\nThis may take a few moments to update on the blockchain. Please try again in a moment.`,
            });
            setNeedsApproval(false);
            setHasCalledEnter(false);
            setIsChecking(false);
            return;
          }
          
          console.log('✅ Allowance verified, entering tournament...');
          
          const dayId = getCurrentDayId();
          
          // Verify dayId is valid before sending transaction
          console.log('📝 Tournament Entry Details:');
          console.log('  Contract:', TOURNAMENT_CONTRACT_ADDRESS);
          console.log('  DayId:', dayId);
          console.log('  ChainId:', chainId);
          console.log('  User Address:', address);
          console.log('  Allowance:', formatUnits(currentAllowance, 6), 'USDC');
          
          // Final pre-check: verify day is not finalized and user hasn't entered
          try {
            const dayInfo = await getDayInfo(dayId);
            if (dayInfo?.finalized) {
              showNotification({
                type: 'warning',
                title: 'Tournament Ended',
                message: 'Today\'s tournament has already ended.',
                details: 'Please wait for tomorrow\'s tournament to enter again.',
              });
              setNeedsApproval(false);
              setHasCalledEnter(false);
              setIsChecking(false);
              return;
            }
            
            const alreadyEntered = await hasEntered(dayId, address!);
            if (alreadyEntered) {
              showNotification({
                type: 'info',
                title: 'Already Entered',
                message: 'You have already entered today\'s tournament.',
                details: 'You can only enter once per day, but you can play as many times as you want!',
              });
              setNeedsApproval(false);
              setHasCalledEnter(false);
              setIsChecking(false);
              return;
            }
          } catch (preCheckError) {
            console.warn('⚠️ Pre-check warning (continuing):', preCheckError);
          }
          
          console.log('🚀 Calling enterTournament...');
          writeTournament({
            address: TOURNAMENT_CONTRACT_ADDRESS,
            abi: TOURNAMENT_ABI,
            functionName: 'enterTournament',
            args: [BigInt(dayId)],
          });
        } catch (error: any) {
          console.error('❌ Error in enterTournament flow:', error);
          let errorMessage = error.message || 'Unknown error';
          if (errorMessage.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
          }
          showNotification({
            type: 'error',
            title: 'Error Entering Tournament',
            message: errorMessage,
            details: 'Check the console for more details.',
          });
          setNeedsApproval(false);
          setHasCalledEnter(false);
          setIsChecking(false);
        }
      }).catch((error) => {
        console.error('❌ Error refetching allowance:', error);
        showNotification({
          type: 'error',
          title: 'Verification Error',
          message: 'Error verifying allowance.',
          details: 'Please try again.',
        });
        setNeedsApproval(false);
        setHasCalledEnter(false);
        setIsChecking(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsApproval, isApprovalSuccess, hasCalledEnter, isEntering, isEnteringTx, address, chainId]);

  // When enter tournament is successful, call onEntered
  useEffect(() => {
    if (isEnterSuccess) {
      console.log('Successfully entered tournament!');
      showNotification({
        type: 'success',
        title: 'Tournament Entry Successful!',
        message: 'You have successfully entered today\'s tournament.',
        details: 'You can now play as many times as you want. Good luck!',
      });
      onEntered?.();
      setNeedsApproval(false);
      setHasCalledEnter(false);
      setIsChecking(false);
    }
  }, [isEnterSuccess, onEntered, showNotification]);

  const handleEnterTournament = useCallback(async () => {
    if (!isConnected || !address) {
      showNotification({
        type: 'warning',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet first to enter the tournament.',
      });
      return;
    }

    // Check network and try to switch if needed
    if (chainId !== ARC_TESTNET_CHAIN_ID) {
      try {
        await switchChain({ chainId: ARC_TESTNET_CHAIN_ID });
        // Wait a moment for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        return; // Will retry after network switch
      } catch (switchError: any) {
        if (switchError.message?.includes('rejected') || switchError.message?.includes('User rejected')) {
          showNotification({
            type: 'warning',
            title: 'Network Switch Rejected',
            message: 'Network switch was rejected.',
            details: 'Please manually switch to ARC Testnet in your wallet.',
          });
        } else {
          showNotification({
            type: 'warning',
            title: 'Wrong Network',
            message: `Please switch to ARC Testnet (Chain ID: ${ARC_TESTNET_CHAIN_ID}).`,
            details: `Current network: ${chain?.name || `Chain ID ${chainId}`}\n\nYou can add ARC Testnet in your wallet settings.`,
          });
        }
        return;
      }
    }

    if (!TOURNAMENT_CONTRACT_ADDRESS) {
      showNotification({
        type: 'error',
        title: 'Configuration Error',
        message: 'Tournament contract not configured.',
        details: 'Please contact support if this issue persists.',
      });
      return;
    }

    setIsChecking(true);
    setNeedsApproval(false);
    setHasCalledEnter(false);

    try {
      // Pre-check: Verify day is not finalized and user hasn't entered
      const dayId = getCurrentDayId();
      console.log('Pre-checking tournament entry for day:', dayId);
      
      try {
        const dayInfo = await getDayInfo(dayId);
        if (dayInfo?.finalized) {
          showNotification({
            type: 'warning',
            title: 'Tournament Ended',
            message: 'Today\'s tournament has already ended.',
            details: 'Please wait for tomorrow\'s tournament to enter again.',
          });
          setIsChecking(false);
          return;
        }
        
        const alreadyEntered = await hasEntered(dayId, address);
        if (alreadyEntered) {
          showNotification({
            type: 'info',
            title: 'Already Entered',
            message: 'You have already entered today\'s tournament.',
            details: 'You can only enter once per day, but you can play as many times as you want!',
          });
          setIsChecking(false);
          return;
        }
      } catch (preCheckError) {
        console.warn('Pre-check failed, continuing anyway:', preCheckError);
        // Continue with transaction - contract will validate
      }
      
      // Check USDC balance
      await refetchBalance();
      const balance = usdcBalance as bigint | undefined;
      console.log('USDC Balance:', balance ? formatUnits(balance, 6) : '0', 'USDC');
      
      if (!balance || balance < ENTRY_FEE) {
        showNotification({
          type: 'error',
          title: 'Insufficient USDC Balance',
          message: 'You don\'t have enough USDC to enter the tournament.',
          details: `Current: ${balance ? formatUnits(balance, 6) : '0'} USDC\nRequired: ${formatUnits(ENTRY_FEE, 6)} USDC\n\nGet test USDC at: https://easyfaucetarc.xyz/`,
        });
        setIsChecking(false);
        return;
      }
      
      // Check current allowance
      await refetchAllowance();
      const currentAllowance = allowance as bigint | undefined;
      console.log('Current Allowance:', currentAllowance ? formatUnits(currentAllowance, 6) : '0', 'USDC');
      
      // Step 1: Approve USDC (only if allowance is insufficient)
      if (!currentAllowance || currentAllowance < ENTRY_FEE) {
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
      } else {
        // Already has sufficient allowance, proceed directly to enterTournament
        // Check if we haven't already called enterTournament
        if (hasCalledEnter) {
          console.log('⚠️ Already called enterTournament, skipping duplicate call');
          return;
        }
        
        console.log('Sufficient allowance already exists, proceeding to enter tournament...');
        setHasCalledEnter(true);
        
        console.log('Calling enterTournament with:', {
          address: TOURNAMENT_CONTRACT_ADDRESS,
          dayId,
          chainId,
        });
        
        writeTournament({
          address: TOURNAMENT_CONTRACT_ADDRESS,
          abi: TOURNAMENT_ABI,
          functionName: 'enterTournament',
          args: [BigInt(dayId)],
        });
      }
    } catch (error: any) {
      console.error('Error entering tournament:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to enter tournament',
        details: 'Please check your wallet connection and try again.',
      });
      setIsChecking(false);
      setNeedsApproval(false);
      setHasCalledEnter(false);
    }
  }, [isConnected, address, writeUSDC, chainId, chain, switchChain, showNotification, refetchBalance, refetchAllowance, allowance, usdcBalance]);

  const isLoading = isChecking || isApproving || isApprovingTx || isEntering || isEnteringTx;

  // Show status messages
  const getStatusMessage = () => {
    if (isApproving || isApprovingTx) return 'Approving USDC...';
    if (isEntering || isEnteringTx) return 'Entering Tournament...';
    if (needsApproval && !isApprovalSuccess) return 'Waiting for approval...';
    return 'Enter Tournament (5 USDC (FAUCET))';
  };

  return (
    <>
      {Modal}
      <div className="space-y-4">
        {networkError && (
          <div className="bg-red-500/20 border border-red-400 text-red-400 p-4 rounded flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-bold mb-1">Wrong Network</div>
              <div>{networkError}</div>
            </div>
          </div>
        )}
      <Button
        onClick={handleEnterTournament}
        disabled={!isConnected || isLoading || !!networkError}
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
            Enter Tournament (5 USDC (FAUCET))
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
    </>
  );
}
