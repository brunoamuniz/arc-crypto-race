import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// ARC Testnet configuration
// Based on: https://docs.arc.network/arc/tutorials/deploy-on-arc
const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 6, // USDC uses 6 decimals
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
} as const;

export const wagmiConfig = createConfig({
  chains: [arcTestnet, mainnet, sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [arcTestnet.id]: http(),
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

