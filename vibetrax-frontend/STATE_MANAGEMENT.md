# VibeTrex Global State Management

## Overview

This application uses a centralized context-based state management system to:

- Avoid redundant API/contract calls
- Automatically refresh data after transactions
- Properly manage loading toasts
- Provide consistent data across components

---

## Architecture

### 1. **AppContext** (`/context/AppContext.jsx`)

Defines the structure of all global state with TypeScript-like documentation.

### 2. **AppProvider** (`/context/AppProvider.jsx`)

Manages all state and provides refresh functions. Automatically fetches data when wallet connects.

### 3. **useAppContext** (`/hooks/useAppContext.jsx`)

Hook to access the global context from any component.

### 4. **Toast Helpers** (`/utils/toastHelpers.js`)

Utilities for consistent toast management with proper cleanup.

---

## Usage Examples

### Basic Component Usage

```jsx
import { useAppContext } from "../../hooks/useAppContext";

const MyComponent = () => {
  const { tokenBalance, isSubscribed, unclaimedRewards, refreshTokenBalance } =
    useAppContext();

  return (
    <div>
      <p>Balance: {tokenBalance} VIBE</p>
      <p>Subscription: {isSubscribed ? "Active" : "Inactive"}</p>
      <p>Rewards: {unclaimedRewards.tokensEarned} VIBE</p>

      <button onClick={refreshTokenBalance}>Refresh Balance</button>
    </div>
  );
};
```

### Using Music Actions (Auto-Refresh)

```jsx
import { useMusicActions } from "../../hooks/useMusicActions";
import { useAppContext } from "../../hooks/useAppContext";

const PurchaseButton = ({ nftId, price }) => {
  const { tokenBalance } = useAppContext();
  const { purchaseTrack } = useMusicActions();

  const handlePurchase = async () => {
    // useMusicActions automatically:
    // 1. Shows loading toast
    // 2. Executes transaction
    // 3. Shows success/error toast (properly dismissing loading)
    // 4. Refreshes tokenBalance and userNfts
    const success = await purchaseTrack(nftId, price);

    if (success) {
      // Your custom logic after purchase
      console.log("Purchase complete!");
    }
  };

  return (
    <button onClick={handlePurchase} disabled={tokenBalance < price}>
      Purchase for {price} VIBE
    </button>
  );
};
```

### Custom Toast Management

```jsx
import {
  showLoadingToast,
  showSuccessToast,
  showErrorToast,
  executeWithToast,
} from "../../utils/toastHelpers";

// Manual approach
const handleCustomAction = async () => {
  const toastId = showLoadingToast("Processing...");

  try {
    await someAsyncOperation();
    showSuccessToast(toastId, "Success!");
  } catch (error) {
    // Properly dismisses loading and shows error
    showErrorToast(toastId, `Failed: ${error.message}`);
  }
};

// Wrapper approach (cleaner)
const handleCustomAction = async () => {
  await executeWithToast(
    async () => {
      return await someAsyncOperation();
    },
    {
      loadingMessage: "Processing...",
      successMessage: "Success!",
      errorMessage: "Operation failed",
      onSuccess: async (result) => {
        // Auto-refresh data after success
        await refreshTokenBalance();
      },
    }
  );
};
```

### Subscription Management

```jsx
import { useAppContext } from "../../hooks/useAppContext";
import { useMusicActions } from "../../hooks/useMusicActions";

const SubscribeButton = () => {
  const { isSubscribed, tokenBalance, refreshSubscription } = useAppContext();
  const { subscribeWithTokens } = useMusicActions();
  const [status, setStatus] = useState("idle");

  const handleSubscribe = async () => {
    if (tokenBalance < 100) {
      showError("Insufficient balance. Need 100 VIBE tokens.");
      return;
    }

    // subscribeWithTokens automatically:
    // 1. Shows loading toast
    // 2. Calls contract
    // 3. Refreshes subscription status AND token balance
    // 4. Properly dismisses loading toast
    await subscribeWithTokens(setStatus);

    // Status will be "success" or "failed"
    if (status === "success") {
      console.log("Now subscribed!");
    }
  };

  if (isSubscribed) {
    return <div>✅ Premium Active</div>;
  }

  return (
    <button onClick={handleSubscribe} disabled={status === "subscribing"}>
      {status === "subscribing" ? "Subscribing..." : "Subscribe for 100 VIBE"}
    </button>
  );
};
```

### Claiming Rewards

```jsx
import { useAppContext } from "../../hooks/useAppContext";
import { useMusicActions } from "../../hooks/useMusicActions";

const ClaimRewardsButton = () => {
  const { unclaimedRewards, canClaimRewards, isLoadingRewards } =
    useAppContext();

  const { claimStreamingRewards } = useMusicActions();

  const handleClaim = async () => {
    if (!canClaimRewards) {
      showError("Please wait 1 hour between claims");
      return;
    }

    // claimStreamingRewards automatically:
    // 1. Shows loading toast
    // 2. Calls contract with Supabase data
    // 3. Refreshes tokenBalance AND rewards data
    // 4. Properly handles errors
    await claimStreamingRewards(
      unclaimedRewards.streams,
      unclaimedRewards.likes,
      unclaimedRewards.nftAddresses
    );
  };

  return (
    <button
      onClick={handleClaim}
      disabled={
        !canClaimRewards ||
        isLoadingRewards ||
        unclaimedRewards.tokensEarned === 0
      }
    >
      {isLoadingRewards
        ? "Checking..."
        : !canClaimRewards
        ? "Cooldown Active"
        : `Claim ${unclaimedRewards.tokensEarned} VIBE`}
    </button>
  );
};
```

### Player State Management

```jsx
import { useAppContext } from "../../hooks/useAppContext";

const MusicPlayer = () => {
  const {
    currentTrack,
    playlist,
    isPlaying,
    setCurrentTrack,
    setPlaylist,
    setIsPlaying,
  } = useAppContext();

  const handlePlay = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleNext = () => {
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex < playlist.length - 1) {
      setCurrentTrack(playlist[currentIndex + 1]);
    }
  };

  return (
    <div>
      {currentTrack && (
        <>
          <h3>{currentTrack.name}</h3>
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button onClick={handleNext}>Next</button>
        </>
      )}
    </div>
  );
};
```

---

## Available Context Values

### State

- `walletAddress`: Current connected wallet address
- `isConnected`: Wallet connection status
- `tokenBalance`: User's VIBE token balance
- `isSubscribed`: Premium subscription status
- `unclaimedRewards`: Object with streams, likes, tokensEarned, nftAddresses
- `canClaimRewards`: Boolean if user can claim (1-hour cooldown check)
- `currentTrack`: Currently playing track
- `playlist`: Current playlist
- `isPlaying`: Play/pause state
- `userNfts`: User's owned NFTs
- `isPendingTransaction`: Global transaction pending state

### Loading States

- `isLoadingBalance`: Token balance loading
- `isLoadingSubscription`: Subscription status loading
- `isLoadingRewards`: Rewards data loading
- `isLoadingNfts`: NFTs loading

### Refresh Functions

- `refreshTokenBalance()`: Refresh user's token balance
- `refreshSubscription()`: Refresh subscription status
- `refreshRewards()`: Refresh unclaimed rewards data
- `refreshNfts()`: Refresh user's NFTs
- `refreshAll()`: Refresh all data at once

### Player Actions

- `setCurrentTrack(track)`: Set currently playing track
- `setPlaylist(tracks[])`: Set current playlist
- `setIsPlaying(boolean)`: Set play/pause state

---

## Important Notes

### ✅ DO:

- Use `useAppContext()` to access shared state
- Let `useMusicActions()` handle auto-refresh after transactions
- Use toast helpers for consistent error handling
- Trust the context's loading states

### ❌ DON'T:

- Call contract view functions directly in components (use context)
- Create duplicate state for tokenBalance, subscription, etc.
- Manually refresh after transactions (useMusicActions does it)
- Use plain `toast.loading()` without proper cleanup

### Toast Best Practices:

```jsx
// ❌ BAD - Loading toast may hang on error
const toastId = toast.loading("Loading...");
await doSomething(); // If this throws, loading toast stays forever
toast.success("Done!", { id: toastId });

// ✅ GOOD - Properly handles errors
const toastId = showLoadingToast("Loading...");
try {
  await doSomething();
  showSuccessToast(toastId, "Done!");
} catch (error) {
  showErrorToast(toastId, `Failed: ${error.message}`);
}

// ✅ BEST - Use the wrapper
await executeWithToast(async () => await doSomething(), {
  loadingMessage: "Loading...",
  successMessage: "Done!",
  errorMessage: "Failed",
});
```

---

## Migration Guide

### Before (Old Way):

```jsx
const [tokenBalance, setTokenBalance] = useState(0);
const { tokenBalance: hookBalance } = useTokenBalance();

useEffect(() => {
  setTokenBalance(hookBalance);
}, [hookBalance]);

const handleTip = async () => {
  await tipArtist(nftId, amount);
  // Manually refresh
  await fetchTokenBalance();
};
```

### After (New Way):

```jsx
const { tokenBalance } = useAppContext();
const { tipArtist } = useMusicActions();

const handleTip = async () => {
  // Auto-refreshes tokenBalance
  await tipArtist(nftId, amount);
};
```

---

## Debugging

Check context state in React DevTools:

1. Install React DevTools browser extension
2. Find `AppContext.Provider` in component tree
3. View all context values in real-time

Console logging:

```jsx
const context = useAppContext();
console.log("Full context:", context);
```
