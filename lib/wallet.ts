import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { arcTestnet } from './arcChain';

export const wagmiConfig = createConfig({
  chains: [arcTestnet, mainnet, sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [arcTestnet.id]: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

/**
 * Truncate wallet address for display
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

