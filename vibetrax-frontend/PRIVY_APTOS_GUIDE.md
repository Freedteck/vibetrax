# Privy + Aptos/Movement Integration Guide

## What Was Wrong

You were trying to configure Privy with `supportedChains` for Aptos, but **Privy's `supportedChains` only works for EVM chains** (Ethereum, Polygon, etc.). Aptos is not an EVM chain, so that approach doesn't work.

## The Correct Approach

Privy supports non-EVM chains like Aptos through their **extended-chains** package, which requires a different workflow:

### 1. **Simple Privy Config** (main.jsx)

```jsx
<PrivyProvider
  appId={import.meta.env.VITE_PRIVY_APP_ID}
  config={{
    loginMethods: ["email", "google", "twitter", "discord", "github"],
    appearance: {
      theme: "dark",
      accentColor: "#6366F1",
    },
  }}
>
```

**No `supportedChains`, no `defaultChain`** - just basic social login setup.

### 2. **Create Aptos Wallet After Login**

```jsx
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";

const { createWallet } = useCreateWallet();

// After user logs in
const wallet = await createWallet({ chainType: "aptos" });
```

### 3. **Sign Transactions with Raw Hash**

```jsx
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';

const { signRawHash } = useSignRawHash();

// Build transaction with Aptos SDK
const rawTxn = await aptos.transaction.build.simple({...});

// Generate signing message
const message = generateSigningMessageForTransaction(rawTxn);

// Sign with Privy
const { signature } = await signRawHash({
  address: walletAddress,
  chainType: 'aptos',
  hash: `0x${toHex(message)}`,
});

// Create authenticator and submit
// (see useMovementWallet.jsx for full implementation)
```

## Files Updated

1. **`/src/hooks/useMovementWallet.jsx`**

   - Added `useSignRawHash` import
   - Implemented proper Aptos transaction signing for Privy wallets
   - Uses raw hash signing instead of Privy's `sendTransaction`

2. **`/src/utils/privyMovement.js`** (NEW)

   - Helper functions for creating and managing Privy Aptos wallets
   - `createMovementWallet()` - Creates wallet if doesn't exist
   - `getMovementWallet()` - Gets existing wallet from user

3. **`/src/hooks/usePrivyMovementWallet.jsx`** (NEW)

   - Optional hook if you want separate Privy wallet management
   - Auto-creates Aptos wallet after Privy authentication

4. **`/src/main.jsx`**

   - Simplified Privy config (removed incorrect `supportedChains`)

5. **`/src/examples/PrivyAptosExample.jsx`** (NEW)
   - Example component showing proper usage

## How It Works Now

### Flow 1: Social Login → Aptos Wallet Creation

```
User clicks "Login with Google"
  ↓
Privy authenticates user (social login)
  ↓
createWallet({ chainType: 'aptos' }) called
  ↓
Privy creates embedded Aptos wallet
  ↓
User has walletAddress from user.linkedAccounts
```

### Flow 2: Transaction Signing

```
User initiates transaction (e.g., purchase track)
  ↓
useMovementWallet.signAndSubmitTransaction() called
  ↓
Detects Privy wallet (isPrivyWallet = true)
  ↓
Builds transaction with Aptos SDK
  ↓
Signs with signRawHash (no popup, automatic)
  ↓
Submits signed transaction to blockchain
  ↓
Returns transaction hash
```

## Key Differences from EVM

| Feature         | EVM (Ethereum)              | Non-EVM (Aptos)                        |
| --------------- | --------------------------- | -------------------------------------- |
| Chain config    | `supportedChains` in config | Not used                               |
| Wallet creation | Automatic on login          | Manual via `createWallet()`            |
| Signing         | `sendTransaction()`         | `signRawHash()` + manual submit        |
| Package         | `@privy-io/react-auth`      | `@privy-io/react-auth/extended-chains` |

## Testing

1. **Login with Privy:**

   ```jsx
   const { login } = useLogin();
   login(); // Opens Privy modal
   ```

2. **Check wallet was created:**

   ```jsx
   const { walletAddress, isPrivyWallet } = useMovementWallet();
   console.log("Privy Aptos wallet:", walletAddress);
   ```

3. **Sign a transaction:**
   ```jsx
   const { signAndSubmitTransaction } = useMovementWallet();
   const result = await signAndSubmitTransaction({
     data: {
       function: `${CONTRACT_ADDRESS}::vibetrax::like_track`,
       functionArguments: [nftId],
     },
   });
   console.log("Transaction hash:", result.hash);
   ```

## Why This Approach?

1. **Privy focuses on UX** - Social login, no seed phrases
2. **Aptos requires different signing** - Ed25519 signatures, not EVM-style
3. **Extended chains package** - Privy's solution for non-EVM chains
4. **Your code handles both** - Native wallets AND Privy seamlessly

## Next Steps

Your `useMovementWallet` hook now supports:

- ✅ Native Aptos wallets (Nightly, etc.)
- ✅ Privy social login wallets
- ✅ Unified transaction signing
- ✅ Automatic wallet type detection

Just use `useMovementWallet()` everywhere and it handles both cases automatically!
