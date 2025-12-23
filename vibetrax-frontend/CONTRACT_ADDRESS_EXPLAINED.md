# Contract Address - Quick Guide

## Your Question: Where to Get Contract Address?

**ANSWER**: The contract address IS your account address where you deployed!

## Your Contract Address

```
0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac
```

Found in: `.movement/config.yaml` → `profiles.default.account`

## How It Works in Movement/Aptos

### 1. When You Deploy

```bash
movement move publish
```

The contract is published **to your account address**, not a separate contract address.

### 2. Move.toml Configuration

```toml
[addresses]
vibetrax = "0x0"  # Placeholder
```

When you publish, Movement **automatically replaces** `0x0` with your actual account address.

### 3. Calling Your Contract

From frontend, you call:
```javascript
const result = await signAndSubmitTransaction({
  function: "0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac::vibetrax::mint_music_nft",
  //        ↑ Your account address                                              ↑ Module  ↑ Function
  arguments: [...]
});
```

## Why You Need It

✅ **Call contract functions** from frontend  
✅ **Query events** your contract emits  
✅ **View functions** to read blockchain data  
✅ **Transaction building** requires the contract address  

## Already Updated For You

I've updated these files with your correct address:

1. ✅ `src/config/constants.js`
2. ✅ `src/config/movement.js`

## How to Verify Your Contract is Deployed

```bash
# Check your account on explorer
movement account list --profile default

# Or visit explorer
https://explorer.movementnetwork.xyz/account/0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac?network=testnet
```

## Common Confusion

❌ **Wrong**: "Where's my contract address? I only see account address!"  
✅ **Right**: "In Movement/Aptos, account address = contract address"

This is different from Ethereum where contracts get separate addresses!

## Testing Your Deployment

### 1. Check if module exists

```bash
movement account list --profile default
```

You should see `vibetrax` module listed.

### 2. Call a view function (if you have one)

```javascript
const result = await aptos.view({
  function: "0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac::vibetrax::get_platform_fee",
  arguments: []
});
console.log("Platform fee:", result);
```

### 3. Check on Explorer

Visit: https://explorer.movementnetwork.xyz/account/0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac?network=testnet

You should see:
- **Modules**: `vibetrax` module
- **Resources**: Any resources your contract created
- **Transactions**: Deployment transaction

## Quick Reference

| Item | Value |
|------|-------|
| **Contract Address** | `0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac` |
| **Account (Same!)** | `0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac` |
| **Module Name** | `vibetrax` |
| **Network** | Movement Testnet (Bardock) |
| **Chain ID** | 250 |
| **Explorer** | https://explorer.movementnetwork.xyz |
| **Config File** | `.movement/config.yaml` |

## Event Type Format

When querying events your contract emits:

```javascript
const eventType = "0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac::vibetrax::MusicNFTMinted";
//                ↑ Contract address                                              ↑ Module  ↑ Event struct name
```

## Next Steps

1. ✅ Contract address is now configured
2. ⏭️ Test wallet connection: `npm run dev`
3. ⏭️ Try minting an NFT to test deployment
4. ⏭️ Check events appear on indexer

---

**Bottom Line**: In Movement/Aptos, your account address IS your contract address. No need to hunt for it - it's in your `.movement/config.yaml` file!
