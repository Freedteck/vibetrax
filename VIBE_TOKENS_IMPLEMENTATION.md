# VIBE Token System Implementation

## Overview
Complete implementation of the VIBE token economy for VibeTrax platform, including token purchase, tipping, boosting, and subscription features.

## Smart Contract Updates

### Location
`/vibetrax-movement/sources/vibetrax.move`

### New Functions Added

#### 1. `initialize_token_balance(user: &signer)`
- **Purpose**: Create a TokenBalance resource for new users
- **Visibility**: `public entry`
- **Behavior**: Creates TokenBalance(0) if user doesn't have one
- **Usage**: Called automatically when a user first connects or manually before token operations

#### 2. `buy_tokens_with_move(buyer: &signer, move_amount: u64)`
- **Purpose**: Purchase VIBE tokens using MOVE
- **Exchange Rate**: 1 MOVE = 1,000 VIBE tokens
- **Visibility**: `public entry`
- **Behavior**:
  - Accepts MOVE amount in octas (8 decimals)
  - Calculates tokens: `(move_amount * 1000) / 100_000_000`
  - Deposits MOVE to treasury
  - Mints VIBE tokens to buyer's TokenBalance
- **Example**: Sending 100,000,000 octas (1 MOVE) yields 1,000 VIBE tokens

## Frontend Components Updated

### 1. TipArtistModal (`/modals/tip-artist-modal/`)

**Changes Made:**
- ✅ Switched from MOVE to VIBE tokens
- ✅ Updated preset amounts: [10, 50, 100, 250, 500] VIBE
- ✅ Added token balance display with FiZap icon
- ✅ Added "Buy Tokens" button that opens BuyTokensModal
- ✅ Input validation checks token balance
- ✅ Shows "insufficient balance" error if needed
- ✅ Updated success message to show VIBE tokens

**Usage:**
```jsx
<TipArtistModal 
  isOpen={showTip}
  onClose={() => setShowTip(false)}
  nftId={track.id}
  artistAddress={track.artist}
  artistName={track.artistName}
/>
```

### 2. BoostSongModal (`/modals/boost-song-modal/`)

**Changes Made:**
- ✅ Switched from MOVE to VIBE tokens
- ✅ Updated preset amounts: [10, 50, 100, 250, 500] VIBE
- ✅ Added token balance display with orange theme
- ✅ Added "Buy Tokens" button
- ✅ Input validation checks token balance
- ✅ Shows boost mechanics explanation (50% artist, 50% burned)
- ✅ Updated success message to show VIBE tokens

**Usage:**
```jsx
<BoostSongModal 
  isOpen={showBoost}
  onClose={() => setShowBoost(false)}
  nftId={track.id}
  songTitle={track.title}
  currentBoostCount={track.boostCount}
/>
```

### 3. BuyTokensModal (`/modals/buy-tokens-modal/`) - NEW

**Features:**
- ✅ Purple gradient theme matching app design
- ✅ Displays current VIBE token balance
- ✅ Exchange rate card: 1 MOVE = 1,000 VIBE
- ✅ Preset MOVE amounts: [1, 5, 10, 50, 100]
- ✅ Live preview of tokens to receive
- ✅ Benefits section explaining token use cases
- ✅ Complete error and success handling
- ✅ Animated UI with pulse effects

**Usage:**
```jsx
<BuyTokensModal 
  isOpen={showBuyTokens}
  onClose={() => setShowBuyTokens(false)}
/>
```

### 4. Header Component (`/components/header/`)

**Changes Made:**
- ✅ Added "Buy VIBE Tokens" button in wallet dropdown
- ✅ Opens BuyTokensModal on click
- ✅ Purple theme for buy button
- ✅ Integrated with existing token balance display

## Hook Updates

### useMusicActions.jsx

**Updated Functions:**

#### `tipArtist(nftId, amount)`
- **Before**: Converted amount to octas (MOVE)
- **After**: Passes amount directly as VIBE tokens (integer)
- **Contract Call**: `vibetrax::tip_artist(nft_address, amount)`
- **Success Message**: "Tipped X VIBE tokens successfully!"

#### `boostSong(nftId, amount)`
- **Before**: Converted amount to octas (MOVE)
- **After**: Passes amount directly as VIBE tokens (integer)
- **Contract Call**: `vibetrax::boost_song(nft_address, amount)`
- **Success Message**: "Boosted with X VIBE tokens!"

#### `buyTokens(moveAmount)` - NEW
- **Purpose**: Purchase VIBE tokens with MOVE
- **Parameters**: moveAmount (float) - MOVE to spend
- **Behavior**:
  - Converts MOVE to octas: `moveAmount * 100_000_000`
  - Calculates VIBE tokens: `moveAmount * 1000`
  - Calls contract: `vibetrax::buy_tokens_with_move(octas)`
  - Shows success with token count
- **Returns**: `boolean` - success/failure

## Token Economics

### Exchange Rate
- **1 MOVE = 1,000 VIBE tokens**
- Fixed rate, implemented in smart contract
- Example purchases:
  - 1 MOVE = 1,000 VIBE
  - 5 MOVE = 5,000 VIBE
  - 10 MOVE = 10,000 VIBE
  - 100 MOVE = 100,000 VIBE

### Token Use Cases

#### 1. Tipping Artists
- Direct support to creators
- 100% goes to the artist
- Suggested amounts: 10-500 VIBE

#### 2. Boosting Songs
- Increases song visibility in discovery/trending
- 50% to artist, 50% burned (deflationary)
- Suggested amounts: 10-500 VIBE

#### 3. Premium Subscription
- Alternative to MOVE payment
- 100 VIBE tokens = 30 days subscription
- 1 MOVE = 30 days subscription

#### 4. Streaming Rewards (Future)
- Artists earn 1 VIBE per stream
- Listeners earn 2 VIBE per like
- Requires backend signature system

## User Flow

### First-Time User
1. Connect wallet via Privy (social login)
2. User has 0 VIBE tokens initially
3. Click "Buy VIBE Tokens" in header dropdown
4. Purchase tokens with MOVE
5. Use tokens to tip, boost, or subscribe

### Returning User
1. Token balance shown in header
2. Can view balance in wallet dropdown
3. Buy more tokens anytime
4. Spend on platform features

### Artist Revenue
- Receives tips (100% of VIBE)
- Receives boost rewards (50% of VIBE)
- Streaming rewards (future implementation)

## CSS Styling

### Color Themes
- **Tip Modal**: Red/pink gradient (#e74c3c, #c0392b)
- **Boost Modal**: Orange gradient (#f39c12, #e67e22)
- **Buy Tokens Modal**: Purple gradient (#9b59b6, #8e44ad)
- **Token Icon**: Blue (#3498db) for balance display

### Animations
- Modal entrance: slideUp + fadeIn
- Button hover: translateY(-2px) + shadow
- Rate arrow: pulse animation
- Alert messages: slideIn

## Testing Checklist

### Smart Contract
- [ ] Deploy updated contract with new functions
- [ ] Test `initialize_token_balance()` - creates TokenBalance(0)
- [ ] Test `buy_tokens_with_move()` - correct exchange rate
- [ ] Test `tip_artist()` - uses VIBE tokens
- [ ] Test `boost_song()` - uses VIBE tokens, splits correctly

### Frontend
- [x] TipArtistModal displays token balance
- [x] TipArtistModal validates sufficient balance
- [x] TipArtistModal opens BuyTokensModal
- [x] BoostSongModal displays token balance
- [x] BoostSongModal validates sufficient balance
- [x] BoostSongModal opens BuyTokensModal
- [x] BuyTokensModal calculates exchange rate correctly
- [x] BuyTokensModal shows live preview
- [x] Header dropdown has "Buy VIBE Tokens" button
- [x] useMusicActions.buyTokens() calls contract correctly

## Deployment Instructions

### 1. Compile Smart Contract
```bash
cd vibetrax-movement
aptos move compile --named-addresses vibetrax=0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac
```

### 2. Deploy Smart Contract
```bash
aptos move publish \
  --named-addresses vibetrax=0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac \
  --network custom \
  --url https://mevm.devnet.m1.movementlabs.xyz/v1
```

### 3. Test Frontend
```bash
cd vibetrax-frontend
npm run dev
```

### 4. Manual Testing
1. Connect wallet
2. Check token balance (should be 0 initially)
3. Buy tokens via header dropdown
4. Verify balance updates
5. Test tipping an artist
6. Test boosting a song
7. Verify insufficient balance errors work

## Next Steps

### 1. Backend for Streaming Rewards
- Set up Node.js + Express server
- Implement Ed25519 signature generation
- Store listening data in Supabase
- Prevent spam/fraud with rate limiting
- Batch reward claims

### 2. Token Initialization
- Add automatic token balance check on wallet connect
- Call `initialize_token_balance()` for new users
- Handle gracefully if already exists

### 3. Discovery/Trending Pages
- Query contract for top boosted songs
- Display boost counts
- Sort by boost amount
- Show trending indicator

### 4. Analytics Dashboard
- Total tokens in circulation
- Total tokens burned (deflationary metric)
- Tips sent/received per artist
- Boost activity over time

## Security Considerations

### Smart Contract
- ✅ Token balance checked before operations
- ✅ Treasury properly receives MOVE payments
- ✅ Abort codes for error handling
- ✅ Owner-only functions for admin operations

### Frontend
- ✅ Input validation (positive integers only)
- ✅ Balance checks before transactions
- ✅ Error messages for insufficient funds
- ✅ Transaction loading states

## Support & Documentation

### Contract Address
```
0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac
```

### Network
- **Chain**: Movement M1 Testnet
- **Chain ID**: 250
- **RPC**: https://mevm.devnet.m1.movementlabs.xyz/v1

### Key Functions
- `initialize_token_balance(user: &signer)`
- `buy_tokens_with_move(buyer: &signer, move_amount: u64)`
- `tip_artist(tipper: &signer, nft_address: address, amount: u64)`
- `boost_song(booster: &signer, nft_address: address, amount: u64)`
- `subscribe_with_tokens(subscriber: &signer)`

---

**Implementation Status**: ✅ Complete
**Last Updated**: 2024
**Author**: VibeTrax Development Team
