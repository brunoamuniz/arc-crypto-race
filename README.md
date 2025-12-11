# 🏎️ ARC CRYPTO RACE

A retro pixel-art Web3 arcade racing game with daily tournaments, prize pools, and on-chain leaderboards. Built with Next.js, React, Solidity, and Supabase.

![ARC CRYPTO RACE](https://img.shields.io/badge/ARC-CRYPTO%20RACE-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![ARC Testnet](https://img.shields.io/badge/Network-ARC%20Testnet-orange)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Smart Contracts](#smart-contracts)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Game Mechanics](#game-mechanics)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🎮 Overview

ARC CRYPTO RACE is a Web3 arcade racing game where players compete in daily tournaments. Players pay a 5 USDC entry fee to participate, race for 5 minutes, and compete for daily prizes distributed to the top 3 players.

### Key Features

- 🏁 **Retro Pixel-Art Racing Game**: Classic pseudo-3D racing experience
- 💰 **Daily Tournaments**: 5 USDC entry fee, prize pool distribution
- 🏆 **On-Chain Leaderboards**: Transparent, verifiable rankings
- 🔐 **Web3 Integration**: MetaMask wallet connection via Wagmi
- 📊 **Real-Time Scoring**: Distance, speed, and crash-based scoring system
- 🎵 **Game Music**: Retro racing soundtrack with mute/unmute controls
- ⏱️ **5-Minute Sessions**: Timed gameplay with early stop option

## ✨ Features

### Game Features
- Progressive difficulty system (increases every minute)
- Dynamic traffic with AI-controlled cars
- Multiple billboard advertisements
- Smooth pseudo-3D rendering
- Responsive controls (arrow keys)

### Web3 Features
- EVM wallet connection (MetaMask)
- USDC token approval and payment
- Smart contract tournament entry
- On-chain checkpoint commits
- Transparent prize distribution

### Backend Features
- Supabase PostgreSQL database
- Real-time leaderboard updates
- Score submission API
- Admin finalization endpoints
- Worker script for blockchain commits

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.7 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.1.9
- **Components**: shadcn/ui (Radix UI)
- **Web3**: Wagmi 3.1.0, Viem 2.41.2
- **Icons**: Lucide React

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat 2.19.0
- **Libraries**: OpenZeppelin Contracts 5.4.0
- **Network**: ARC Testnet (Chain ID: 5042002)

### Backend
- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API Routes
- **Worker**: TypeScript (tsx)

### Game Engine
- **Language**: Vanilla JavaScript
- **Rendering**: HTML5 Canvas
- **Assets**: Pixel-art sprites and music

## 📁 Project Structure

```
arc-crypto-race/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin endpoints
│   │   ├── leaderboard/          # Leaderboard API
│   │   └── submit-score/        # Score submission
│   ├── game/                     # Game page
│   ├── leaderboard/              # Leaderboard page
│   └── page.tsx                  # Landing page
│
├── components/                    # React Components
│   ├── ui/                       # shadcn/ui components
│   ├── GameCanvas.tsx            # Game wrapper
│   ├── HUDScore.tsx              # In-game HUD
│   ├── EnterTournamentButton.tsx # Tournament entry
│   └── WalletConnectButton.tsx   # Wallet connection
│
├── contracts/                    # Smart Contracts
│   ├── src/
│   │   └── Tournament.sol       # Main contract
│   ├── scripts/
│   │   └── deploy.js            # Deployment script
│   └── hardhat.config.js        # Hardhat config
│
├── lib/                          # Utilities
│   ├── contract.ts               # Contract interactions
│   ├── supabase.ts              # Supabase client
│   ├── scoring.ts                # Score calculation
│   ├── wallet.ts                 # Wagmi config
│   └── dayId.ts                  # Day ID utilities
│
├── game/                         # Game Engine (source)
│   ├── common.js                 # Core game logic
│   ├── game-wrapper.js          # React integration
│   ├── stats.js                  # FPS counter
│   └── assets/                   # Game assets
│       ├── images/               # Sprites
│       └── music/                # Audio files
│
├── public/                       # Static Assets
│   └── game/                     # Served game files
│
├── scripts/                      # Utility Scripts
│   ├── worker.ts                 # Blockchain worker
│   ├── check-tournament-entry.ts # Entry verification
│   └── test-contract-interaction.ts # Contract tests
│
└── docs/                         # Documentation
    ├── SUPABASE_SCHEMA.sql      # Database schema
    └── USDC_ADDRESS_UPDATE.md   # USDC address info
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- MetaMask or compatible EVM wallet
- ARC Testnet USDC (for testing)
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arc-crypto-race
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd contracts && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Set up Supabase**
   - Create a Supabase project
   - Run the schema: `docs/SUPABASE_SCHEMA.sql`
   - Get your project URL and keys

5. **Deploy smart contract** (optional, for testing)
   ```bash
   cd contracts
   npm run deploy:arc
   # Update NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS in .env
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

7. **Start worker** (in separate terminal)
   ```bash
   npm run worker
   ```

Visit `http://localhost:3000` to see the application.

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_PASSWORD=your_db_password

# Blockchain - ARC Testnet
NEXT_PUBLIC_ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x...
USDC_ADDRESS=0x3600000000000000000000000000000000000000

# Admin
ADMIN_API_KEY=your_admin_api_key

# Contract Owner (for deploy and transactions)
PRIVATE_KEY=0x...
```

**⚠️ IMPORTANT**: Never commit `.env` files. They contain sensitive information.

## 📜 Smart Contracts

### Tournament Contract

The main contract (`contracts/src/Tournament.sol`) manages:

- **Entry Fees**: 5 USDC per tournament entry
- **Prize Distribution**: 60% / 25% / 15% for 1st / 2nd / 3rd place
- **Site Fee**: 10% of total pool
- **Checkpoints**: Periodic leaderboard hash commits
- **Finalization**: Daily tournament closure and prize distribution

### Key Functions

- `enterTournament(uint256 dayId)`: Enter a daily tournament
- `commitCheckpoint(uint256 dayId, bytes32 hash)`: Commit leaderboard state
- `finalizeDay(uint256 dayId, address[3], uint256[3])`: Finalize and distribute prizes
- `getDayInfo(uint256 dayId)`: Query tournament information
- `hasEntered(uint256 dayId, address)`: Check if wallet entered

### Deployment

```bash
cd contracts
npm run deploy:arc
```

The contract address will be printed. Update `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS` in `.env`.

## 🗄️ Database Schema

The Supabase database uses the following tables:

- **`scores`**: All raw score submissions
- **`best_scores`**: Best score per wallet per day (auto-updated via trigger)
- **`pending_commits`**: Queue for blockchain operations
- **`commit_logs`**: Logs of completed blockchain transactions

See `docs/SUPABASE_SCHEMA.sql` for the complete schema.

## 🔌 API Routes

### Public APIs

- `POST /api/submit-score`: Submit a game score
  ```json
  {
    "wallet": "0x...",
    "dayId": 20251211,
    "score": 12345
  }
  ```

- `GET /api/leaderboard?dayId=20251211`: Get leaderboard for a day
  ```json
  {
    "dayId": 20251211,
    "leaderboard": [...],
    "checkpoints": [...],
    "onChainWinners": {...}
  }
  ```

### Admin APIs

- `POST /api/admin/finalize-day`: Finalize a day's tournament
  - Requires `x-admin-api-key` header
  - Body: `{ "dayId": 20251211 }`

## 🎮 Game Mechanics

### Scoring Formula

```
Score = (distance × 10) + (maxSpeed × 2) - (elapsedTime × 5) - (crashes × 100)
```

### Game Rules

- **Duration**: 5 minutes (300 seconds)
- **Entry Fee**: 5 USDC per day
- **Difficulty**: Increases every minute
- **Controls**: Arrow keys (left/right/up/down)
- **Early Stop**: "Stop Playing" button saves current score

### Progressive Difficulty

- **Level 1** (0-60s): Base difficulty
- **Level 2** (60-120s): +20% more cars, +15% speed
- **Level 3+**: Further increases per minute

## 🚢 Deployment

### Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Ensure all `.env` variables are set in Vercel dashboard.

### Worker Deployment

The worker script (`scripts/worker.ts`) should run as a cron job or background service:

```bash
npm run worker
```

Or use a service like:
- Vercel Cron Jobs
- Railway
- Render Cron Jobs

## 🧪 Testing

### Contract Testing

```bash
cd contracts
npm test
```

### Contract Interaction Testing

```bash
npx tsx scripts/test-contract-interaction.ts
```

### Tournament Entry Verification

```bash
npx tsx scripts/check-tournament-entry.ts [wallet_address]
```

### Transaction Verification

```bash
npx tsx scripts/check-transaction.ts
```

## 📚 Documentation

All documentation is available in the [`/docs`](./docs) directory:

- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Integration Guide](./docs/INTEGRATION_GUIDE.md)
- [Testing Guide](./docs/TESTING_GUIDE.md)
- [Supabase Setup](./docs/SUPABASE_SETUP.md)
- [USDC Address Update](./docs/USDC_ADDRESS_UPDATE.md)
- [Quick Start](./docs/QUICK_START.md)
- [ARC Testnet Info](./docs/ARC_TESTNET_INFO.md)
- [Sprite Editing Guide](./docs/SPRITE_EDITING_GUIDE.md)

## 🔒 Security

### Data Protection

- **Never commit** `.env` files
- Use `.env.example` as a template
- Store private keys securely
- Use service role keys only on the server

### Smart Contract Security

- Contracts are audited (recommended before mainnet)
- Use OpenZeppelin contracts for security
- Owner-only functions are protected

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

See [docs/LICENSE](./docs/LICENSE) for license information.

## 🔗 Links

- **ARC Network Docs**: https://docs.arc.network
- **ArcScan Explorer**: https://testnet.arcscan.app
- **Supabase**: https://supabase.com
- **Next.js**: https://nextjs.org
- **Wagmi**: https://wagmi.sh

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the test scripts in `/scripts`

---

**Built with ❤️ for the Web3 gaming community**
