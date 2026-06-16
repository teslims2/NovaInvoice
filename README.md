# NovaInvoice ⚡

> **Transforming unpaid invoices into instant working capital using Stellar blockchain technology.**

NovaInvoice is a decentralised invoice financing protocol that allows businesses and freelancers to tokenise outstanding invoices and receive USDC liquidity immediately — without waiting 30, 60, or 90 days for clients to pay. Built on the Stellar network with Soroban smart contracts.

---

## The Problem

Invoice payment delays are one of the biggest cash flow killers for small businesses and independent contractors across Africa and emerging markets. A business may have $10,000 in legitimate, signed invoices but still be unable to pay staff or take on new work while waiting for those funds to arrive.

## The Solution

NovaInvoice lets you:

1. **Submit** an unpaid invoice on-chain
2. **Receive** instant USDC working capital (up to 80% of invoice face value)
3. **Repay** automatically when the client settles — the smart contract handles reconciliation

No banks. No lengthy credit checks. No middlemen.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| Blockchain | Stellar Network (Testnet + Mainnet) |
| Smart Contracts | Soroban (Rust-based), deployed on Stellar |
| Stablecoin | USDC on Stellar |
| Wallet | Freighter browser extension (`@stellar/freighter-api`) |
| Stellar SDK | `@stellar/stellar-sdk` v15, `@stellar/stellar-base` v15 |

---

## Features

- **Invoice tokenisation** — register invoices on-chain with verifiable metadata
- **Instant USDC liquidity** — receive up to 80% of invoice value immediately
- **Soroban smart contracts** — trustless, programmable settlement logic
- **Freighter wallet integration** — sign transactions directly from your browser
- **Prisma + PostgreSQL** — off-chain invoice records with full audit trail
- **Testnet support** — develop and test against Stellar testnet with free XLM

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or hosted, e.g. Supabase / Neon)
- [Freighter wallet extension](https://freighter.app) installed in your browser
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli) (for contract deployment)

### 1. Clone the repository

```bash
git clone https://github.com/teslims2/NovaInvoice.git
cd NovaInvoice
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/novainvoice"

# Stellar Network: "testnet" or "mainnet"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"

# USDC asset issuer on testnet
NEXT_PUBLIC_USDC_ISSUER="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"

# Soroban contract ID (deploy your contract and paste the ID here)
NEXT_PUBLIC_SOROBAN_CONTRACT_ID=""

# App URL
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to your database
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying the Soroban Contract

If you need to deploy the smart contract to Stellar testnet:

```bash
# Generate a funded testnet identity
stellar keys generate alice --network testnet --fund

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/novainvoice.wasm \
  --source-account alice \
  --network testnet \
  --alias novainvoice
```

Copy the returned contract ID and set it as `NEXT_PUBLIC_SOROBAN_CONTRACT_ID` in your `.env`.

---

## Project Structure

```
NovaInvoice/
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── app/             # Next.js App Router pages and layouts
│   ├── components/      # UI components
│   ├── lib/             # Stellar SDK helpers, Prisma client
│   └── types/           # TypeScript interfaces
├── .env.example
├── next.config.js
├── package.json
├── prisma.config.ts
└── tailwind.config.js
```

---

## Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` | Yes |
| `NEXT_PUBLIC_USDC_ISSUER` | USDC issuer address on Stellar | Yes |
| `NEXT_PUBLIC_SOROBAN_CONTRACT_ID` | Deployed Soroban contract ID | Yes (for on-chain features) |
| `NEXTAUTH_URL` | Base URL of the application | Yes |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |

---

## Stellar Testnet Resources

- [Stellar Laboratory](https://laboratory.stellar.org) — inspect accounts, transactions, and contracts
- [Friendbot](https://friendbot.stellar.org) — fund a testnet account with free XLM
- [Soroban Testnet RPC](https://soroban-testnet.stellar.org) — RPC endpoint for contract interaction
- [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet) — block explorer

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change, then submit a pull request against the `main` branch.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a PR

---

## Roadmap

- [ ] Invoice NFT minting on Stellar
- [ ] Lender-side dashboard for liquidity providers
- [ ] Multi-currency support (XLM, USDC, EURC)
- [ ] Mobile-responsive PWA
- [ ] Mainnet deployment
- [ ] On-chain credit scoring based on repayment history

---

## License

MIT © [teslims2](https://github.com/teslims2)

---

## Acknowledgements

Built on the [Stellar](https://stellar.org) network. Powered by [Soroban](https://soroban.stellar.org) smart contracts. Wallet integration via [Freighter](https://freighter.app).
