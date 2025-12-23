# VibeTrax Implementation Audit & Roadmap

**Date:** December 23, 2025  
**Status:** Smart Contract Deployed ✅ | Frontend Integration Pending ⚠️

---

## 🔍 SMART CONTRACT ANALYSIS

### ✅ Deployed Contract Features
Location: `vibetrax-movement/sources/vibetrax.move`  
Address: `0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac`

#### Core Functions (14 entry functions):
1. ✅ `initialize` - Platform initialization
2. ✅ `mint_music_nft` - Create music NFTs with collaborators
3. ✅ `purchase_music_nft` - Buy NFTs with royalty distribution
4. ✅ `tip_artist` - Send tips to artists
5. ✅ `claim_streaming_rewards` - Claim rewards with signature verification
6. ✅ `subscribe_with_move` - Premium subscription (MOVE)
7. ✅ `subscribe_with_tokens` - Premium subscription (tokens)
8. ✅ `boost_song` - Promote songs with tokens
9. ✅ `update_nft_metadata` - Update NFT details
10. ✅ `update_nft_files` - Update IPFS files
11. ✅ `delete_nft` - Delete NFT
12. ✅ `withdraw_from_treasury` - Admin treasury withdrawal
13. ✅ `toggle_for_sale` - List/delist NFT
14. ✅ `update_base_price` - Change NFT price

#### View Functions (13 read-only):
- `get_nft_info` - Full NFT details
- `get_nft_price` - Current price
- `get_nft_engagement` - Metrics
- `get_user_token_balance` - Token balance
- `get_user_pending_rewards` - Unclaimed rewards
- `get_nfts_by_artist` - Artist's NFTs
- `get_nfts_by_genre` - Genre filtering
- `get_all_nfts` - All NFTs
- `is_subscribed` - Subscription status
- `get_subscription_expiry` - Expiry timestamp
- `get_nft_payment_history` - Transaction history
- `get_trending_nfts` - Most boosted
- `calculate_dynamic_price` - Price formula

#### Events (11 types):
- MusicNFTMinted
- MusicNFTPurchased
- RewardsClaimed
- TipSent
- PriceUpdated
- TokensMinted
- SubscriptionPurchased/Renewed
- NFTBoosted
- NFTDeleted/Updated
- TreasuryWithdrawn

---

## ⚠️ FRONTEND INTEGRATION STATUS

### 🔴 NOT IMPLEMENTED (Critical):

#### 1. **Core Transaction Functions**
All hooks have TODO stubs:

**`hooks/useMusicActions.jsx`:**
- ❌ `voteForTrack` - No voting in contract (remove or implement differently)
- ❌ `purchaseTrack` - Should call `purchase_music_nft`
- ❌ `toggleTrackForSale` - Should call `toggle_for_sale`
- ❌ `deleteTrack` - Should call `delete_nft`
- ❌ `subscribe` - Should call `subscribe_with_move` or `subscribe_with_tokens`

**`hooks/useMusicUpload.jsx`:**
- ❌ `uploadMusic` - Should call `mint_music_nft`
- ❌ `updateMusic` - Should call `update_nft_metadata` or `update_nft_files`

#### 2. **Missing Features from Contract**
Features in smart contract but NOT in frontend:

- ❌ **Tipping System** - `tip_artist` function exists
- ❌ **Rewards Claiming** - `claim_streaming_rewards` with backend signature
- ❌ **Song Boosting** - `boost_song` promotion system
- ❌ **Subscription Management** - Two payment methods available
- ❌ **Collaborator System** - Splits on NFT minting
- ❌ **Token Balance Display** - `VibetraxToken` system
- ❌ **Payment History** - Event tracking available
- ❌ **Trending/Boosted Songs** - `get_trending_nfts` view

#### 3. **Data Fetching via Indexer**
**Current:**
```javascript
// hooks/useMusicNfts.jsx
const { data: musicNfts } = useQuery({
  queryKey: ["musicNfts"],
  queryFn: async () => {
    // Using Movement indexer for events
    const events = await aptos.getAccountEventsByEventType({
      accountAddress: CONTRACT_ADDRESS,
      eventType: `${CONTRACT_ADDRESS}::vibetrax::MusicNFTMinted`,
    });
    // Maps events to NFT data
  }
});
```

**Issues:**
- ✅ Basic event fetching works
- ❌ Not fetching full NFT data via view functions
- ❌ No caching strategy
- ❌ Not using Movement Indexer GraphQL (better performance)

---

## 🚀 INTEGRATION ROADMAP

### Phase 1: Core Transaction Implementation (HIGHEST PRIORITY)

#### A. Implement Purchase Flow
```javascript
// hooks/useMusicActions.jsx
const purchaseTrack = async (nftAddress, price) => {
  const tx = await signAndSubmitTransaction({
    sender: walletAddress,
    data: {
      function: `${CONTRACT_ADDRESS}::vibetrax::purchase_music_nft`,
      typeArguments: [],
      functionArguments: [nftAddress, price],
    },
  });
  
  await aptos.waitForTransaction({ transactionHash: tx.hash });
  toast.success("Purchase successful!");
};
```

#### B. Implement Mint/Upload Flow
```javascript
// hooks/useMusicUpload.jsx
const uploadMusic = async (formData) => {
  // 1. Upload files to IPFS (already done)
  // 2. Call mint_music_nft
  const tx = await signAndSubmitTransaction({
    sender: walletAddress,
    data: {
      function: `${CONTRACT_ADDRESS}::vibetrax::mint_music_nft`,
      typeArguments: [],
      functionArguments: [
        stringToBytes(formData.title),
        stringToBytes(formData.description),
        stringToBytes(formData.genre),
        stringToBytes(ipfsHashes.artHash),
        stringToBytes(ipfsHashes.highQualityHash),
        stringToBytes(ipfsHashes.lowQualityHash),
        formData.price,
        formData.royaltyPercentage,
        formData.collaborators || [],
        formData.collaboratorRoles || [],
        formData.collaboratorSplits || [],
      ],
    },
  });
};
```

#### C. Implement Subscription
```javascript
const subscribe = async (paymentMethod = "MOVE") => {
  const functionName = paymentMethod === "MOVE" 
    ? "subscribe_with_move"
    : "subscribe_with_tokens";
    
  const tx = await signAndSubmitTransaction({
    sender: walletAddress,
    data: {
      function: `${CONTRACT_ADDRESS}::vibetrax::${functionName}`,
      typeArguments: [],
      functionArguments: [],
    },
  });
};
```

### Phase 2: Data Fetching Optimization

#### A. Use Movement Indexer GraphQL
**Setup:**
```javascript
// config/movement.js
export const MOVEMENT_INDEXER_URL = 
  "https://indexer.testnet.movementnetwork.xyz/v1/graphql";

// GraphQL query for NFTs
const GET_NFTS_QUERY = `
  query GetMusicNFTs($contractAddress: String!) {
    events(
      where: {
        account_address: { _eq: $contractAddress }
        type: { _like: "%MusicNFTMinted%" }
      }
      order_by: { transaction_version: desc }
    ) {
      data
      transaction_version
      indexed_at
    }
  }
`;
```

**Benefits:**
- 🚀 Faster queries with indexing
- 📊 Complex filtering (by genre, artist, date)
- 🔍 Search capabilities
- 📈 Trending/sorting logic

#### B. Combine Indexer + View Functions
```javascript
// hooks/useMusicNfts.jsx
const { data: musicNfts } = useQuery({
  queryKey: ["musicNfts"],
  queryFn: async () => {
    // 1. Get NFT addresses from indexer (fast)
    const events = await fetchFromIndexer();
    
    // 2. Get full data via view functions (batch)
    const nftDetails = await Promise.all(
      events.map(event => 
        aptos.view({
          function: `${CONTRACT_ADDRESS}::vibetrax::get_nft_info`,
          typeArguments: [],
          functionArguments: [event.nft_address],
        })
      )
    );
    
    return nftDetails;
  },
  staleTime: 30000, // Cache for 30 seconds
});
```

### Phase 3: New Features

#### A. Tipping System
```javascript
// components/TipButton.jsx
const sendTip = async (artistAddress, nftAddress, amount) => {
  const tx = await signAndSubmitTransaction({
    sender: walletAddress,
    data: {
      function: `${CONTRACT_ADDRESS}::vibetrax::tip_artist`,
      typeArguments: [],
      functionArguments: [artistAddress, nftAddress, amount],
    },
  });
};
```

#### B. Rewards Claiming
**Requires Backend:**
```javascript
// Backend generates signature
POST /api/rewards/claim
Body: { userAddress, streams, likes }
Response: { signature, message }

// Frontend claims with signature
const claimRewards = async (streams, likes, signature) => {
  const tx = await signAndSubmitTransaction({
    sender: walletAddress,
    data: {
      function: `${CONTRACT_ADDRESS}::vibetrax::claim_streaming_rewards`,
      typeArguments: [],
      functionArguments: [streams, likes, signature, nonce],
    },
  });
};
```

#### C. Song Boosting
```javascript
const boostSong = async (nftAddress, tokenAmount) => {
  const tx = await signAndSubmitTransaction({
    sender: walletAddress,
    data: {
      function: `${CONTRACT_ADDRESS}::vibetrax::boost_song`,
      typeArguments: [],
      functionArguments: [nftAddress, tokenAmount],
    },
  });
};
```

#### D. Trending Page
```javascript
// routes/trending/Trending.jsx
const { data: trendingNfts } = useQuery({
  queryKey: ["trending"],
  queryFn: async () => {
    const result = await aptos.view({
      function: `${CONTRACT_ADDRESS}::vibetrax::get_trending_nfts`,
      typeArguments: [],
      functionArguments: [20], // top 20
    });
    return result[0]; // Returns vector of addresses
  },
});
```

---

## 🛠️ ORACLE & BACKEND INTEGRATION

### A. Backend Requirements

#### 1. **Signature Service** (Critical for Rewards)
```javascript
// backend/services/signatureService.js
import { Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

class SignatureService {
  constructor(privateKey) {
    this.privateKey = Ed25519PrivateKey.fromString(privateKey);
  }

  generateRewardSignature(userAddress, streams, likes, nonce) {
    // Create message to sign
    const message = `${userAddress}:${streams}:${likes}:${nonce}`;
    const messageBytes = new TextEncoder().encode(message);
    
    // Sign with ed25519
    const signature = this.privateKey.sign(messageBytes);
    
    return {
      signature: signature.toString(),
      message: message,
    };
  }
}

// API endpoint
app.post("/api/rewards/claim", async (req, res) => {
  const { userAddress, streams, likes } = req.body;
  
  // Verify user's streaming data from analytics DB
  const verified = await verifyUserMetrics(userAddress, streams, likes);
  if (!verified) {
    return res.status(400).json({ error: "Invalid metrics" });
  }
  
  // Generate signature
  const nonce = Date.now();
  const sig = signatureService.generateRewardSignature(
    userAddress, 
    streams, 
    likes, 
    nonce
  );
  
  res.json({ ...sig, nonce });
});
```

#### 2. **Streaming Analytics Service**
```javascript
// Track play counts
app.post("/api/analytics/stream", async (req, res) => {
  const { userAddress, nftAddress } = req.body;
  
  await db.incrementStream(userAddress, nftAddress);
  
  // Periodically sync to blockchain via indexer events
});

// Track likes
app.post("/api/analytics/like", async (req, res) => {
  const { userAddress, nftAddress } = req.body;
  
  await db.incrementLike(userAddress, nftAddress);
});
```

#### 3. **Indexer Listener** (Event Processing)
```javascript
// backend/services/indexerListener.js
import { WebSocket } from "ws";

class IndexerListener {
  constructor() {
    this.ws = new WebSocket(MOVEMENT_INDEXER_WS);
  }

  listen() {
    // Subscribe to contract events
    this.ws.send(JSON.stringify({
      type: "subscribe",
      payload: {
        address: CONTRACT_ADDRESS,
        events: [
          "MusicNFTMinted",
          "MusicNFTPurchased",
          "RewardsClaimed",
          "SubscriptionPurchased",
        ],
      },
    }));

    this.ws.on("message", (data) => {
      const event = JSON.parse(data);
      
      // Process events
      switch (event.type) {
        case "MusicNFTMinted":
          this.handleNFTMinted(event.data);
          break;
        case "MusicNFTPurchased":
          this.handlePurchase(event.data);
          break;
        // ... etc
      }
    });
  }

  async handleNFTMinted(data) {
    // Update database
    await db.nfts.create({
      address: data.nft_address,
      artist: data.artist,
      title: data.title,
      price: data.base_price,
      // ... fetch full data via view function
    });

    // Invalidate frontend cache
    await redis.del("musicNfts:*");
  }
}
```

### B. Oracle Integration (For External Data)

#### 1. **Price Oracles** (Optional - for USD pricing)
```javascript
// If you want to price in USD instead of MOVE
// Use Pyth or Switchboard oracle

// contracts/price_oracle.move
module vibetrax::price_oracle {
    use pyth::price_feed;
    
    public fun get_move_usd_price(): u64 {
        let price_feed_id = @0x...;  // MOVE/USD feed
        let price = price_feed::get_price(price_feed_id);
        price.price
    }
}
```

#### 2. **Randomness Oracle** (For Playlist Shuffle, Recommendations)
```javascript
// Use Aptos randomness module
module vibetrax::recommendations {
    use aptos_framework::randomness;
    
    public entry fun get_random_songs(count: u64): vector<address> {
        let seed = randomness::u64_range(0, 1000000);
        // ... generate random selection
    }
}
```

---

## 📊 IMPLEMENTATION PRIORITY

### 🔴 **CRITICAL (Week 1)**
1. ✅ Wallet integration (DONE)
2. ❌ Purchase NFT transaction
3. ❌ Mint NFT transaction
4. ❌ Fetch NFT data via view functions
5. ❌ Display NFT metadata correctly

### 🟡 **HIGH (Week 2)**
6. ❌ Subscription system
7. ❌ Toggle for sale
8. ❌ Update/Delete NFT
9. ❌ Backend signature service
10. ❌ Streaming analytics tracking

### 🟢 **MEDIUM (Week 3)**
11. ❌ Tipping feature
12. ❌ Rewards claiming
13. ❌ Song boosting
14. ❌ Trending page
15. ❌ Payment history view

### 🔵 **LOW (Week 4)**
16. ❌ Collaborator splits UI
17. ❌ Token balance display
18. ❌ Advanced filtering (genre, date)
19. ❌ Search functionality
20. ❌ Recommendation engine

---

## 🐛 POTENTIAL ERRORS TO FIX

### 1. **Type Mismatches**
```javascript
// ❌ WRONG
functionArguments: ["0x123", 1000000]

// ✅ CORRECT
functionArguments: [
  "0x123",  // address
  "1000000", // u64 as string
]
```

### 2. **Missing String Encoding**
```javascript
// Contract expects vector<u8>
const stringToBytes = (str) => {
  return Array.from(new TextEncoder().encode(str));
};

functionArguments: [
  stringToBytes(title),  // ✅ CORRECT
  // NOT: title,  ❌ WRONG
];
```

### 3. **Nonce for Rewards**
```javascript
// Must track nonce to prevent replay attacks
if (!exists<UserClaimInfo>(user_addr)) {
    move_to(user, UserClaimInfo {
        last_claim_time: 0,
        pending_streams: 0,
        pending_likes: 0,
        nonce: 0,
    });
};
```

### 4. **Subscription Check**
```javascript
// Check before allowing premium features
const { data: isSubscribed } = useQuery({
  queryKey: ["subscription", walletAddress],
  queryFn: async () => {
    const result = await aptos.view({
      function: `${CONTRACT_ADDRESS}::vibetrax::is_subscribed`,
      functionArguments: [walletAddress],
    });
    return result[0];
  },
});
```

---

## 📝 NEXT STEPS

1. **Create transaction utility helpers**
   ```bash
   touch vibetrax-frontend/src/utils/contractCalls.js
   ```

2. **Implement purchase function first** (most critical)

3. **Set up backend signature service**

4. **Test with Movement testnet faucet**
   - Get testnet MOVE: https://faucet.movementnetwork.xyz/

5. **Monitor transactions**
   - Explorer: https://explorer.movementnetwork.xyz/

---

## 🎯 SUCCESS METRICS

- [ ] User can mint NFT successfully
- [ ] User can purchase NFT with royalty split
- [ ] User can subscribe (MOVE or tokens)
- [ ] User can claim rewards with valid signature
- [ ] NFTs display correctly with all metadata
- [ ] Trending/boosted songs work
- [ ] Tips flow correctly to artists
- [ ] Zero transaction failures

---

**Would you like me to start implementing any of these phases?**
