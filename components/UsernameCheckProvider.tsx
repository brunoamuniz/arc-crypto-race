"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { UsernameModal } from './UsernameModal';

/**
 * Component that checks for username when wallet connects
 * Should be placed inside WagmiProvider
 */
export function UsernameCheckProvider() {
  const { isConnected, address } = useAccount();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [hasCheckedUsername, setHasCheckedUsername] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check username when wallet connects
  useEffect(() => {
    if (!isMounted) return;
    if (!isConnected || !address) {
      setHasCheckedUsername(false);
      setShowUsernameModal(false);
      return;
    }
    if (hasCheckedUsername) return; // Already checked for this wallet
    
    const checkUsername = async () => {
      try {
        const response = await fetch(`/api/me?wallet=${encodeURIComponent(address)}`);
        
        if (!response.ok) {
          // If API fails, don't block user
          console.warn('Failed to check username, continuing without modal');
          setHasCheckedUsername(true);
          return;
        }

        const data = await response.json();

        if (data.ok && !data.hasUsername) {
          // User doesn't have a username, show modal
          setShowUsernameModal(true);
        }
        setHasCheckedUsername(true);
      } catch (error) {
        console.error('Error checking username:', error);
        // Don't block user if check fails
        setHasCheckedUsername(true);
      }
    };

    // Small delay to avoid race conditions
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [isMounted, isConnected, address, hasCheckedUsername]);

  const handleUsernameConfirm = (username: string) => {
    console.log('Username confirmed:', username);
    setShowUsernameModal(false);
    // Username is saved via API, no need to do anything else
  };

  // Reset check when wallet disconnects or changes
  useEffect(() => {
    if (!isConnected || !address) {
      setHasCheckedUsername(false);
      setShowUsernameModal(false);
    }
  }, [isConnected, address]);

  if (!isConnected || !address) {
    return null;
  }

  return (
    <UsernameModal
      open={showUsernameModal}
      onClose={() => setShowUsernameModal(false)}
      onConfirm={handleUsernameConfirm}
      wallet={address}
    />
  );
}
