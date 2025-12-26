# VibeTrax Backend

Simple Express + Supabase backend for tracking streams, likes, and reward claims.

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Create Supabase project:**

   - Go to https://supabase.com
   - Create a new project
   - Copy your project URL and service role key

3. **Set up database:**

   - Go to SQL Editor in Supabase
   - Run the SQL from `src/db/schema.sql`

4. **Configure environment:**

```bash
cp .env.example .env
```

Then edit `.env` with your Supabase credentials

5. **Run development server:**

```bash
npm run dev
```

## API Endpoints

### Track Stream

```http
POST /api/streams
Content-Type: application/json

{
  "userAddress": "0x...",
  "nftAddress": "0x...",
  "duration": 120
}
```

### Track Like

```http
POST /api/likes
Content-Type: application/json

{
  "userAddress": "0x...",
  "nftAddress": "0x..."
}
```

### Remove Like

```http
DELETE /api/likes
Content-Type: application/json

{
  "userAddress": "0x...",
  "nftAddress": "0x..."
}
```

### Get Unclaimed Rewards

```http
GET /api/rewards/:userAddress
```

### Mark Rewards as Claimed

```http
POST /api/rewards/claim
Content-Type: application/json

{
  "userAddress": "0x...",
  "transactionHash": "0x..."
}
```

### Get Claim History

```http
GET /api/rewards/history/:userAddress
```

### Get NFT Stats

```http
GET /api/nfts/:nftAddress/stats
```

## Features

- ✅ Track streams (minimum 30 seconds)
- ✅ Track likes (one per user per track)
- ✅ Calculate unclaimed rewards
- ✅ Record claim transactions
- ✅ NFT statistics
- ✅ Rate limiting
- ✅ CORS protection
- ✅ No signature verification needed (simplified)

## Deployment

Deploy to Railway, Render, or any Node.js hosting platform.
