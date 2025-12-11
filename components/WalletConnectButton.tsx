"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { truncateAddress } from '@/lib/wallet';

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono" style={{ color: "var(--neon-green)" }}>
          {truncateAddress(address)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="pixel-border text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  const injectedConnector = connectors.find((c) => c.id === 'injected') || connectors[0];

  return (
    <Button
      size="lg"
      variant="outline"
      className="pixel-border text-sm md:text-base px-8 py-6 font-bold hover:scale-105 transition-transform bg-transparent"
      style={{
        borderColor: "var(--neon-cyan)",
        color: "var(--neon-cyan)",
      }}
      onClick={() => {
        if (injectedConnector) {
          connect({ connector: injectedConnector });
        }
      }}
    >
      <Wallet className="mr-2 h-5 w-5" />
      CONNECT WALLET
    </Button>
  );
}

