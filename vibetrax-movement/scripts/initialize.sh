#!/bin/bash

# Initialize VibeTrax contract on Movement M1 Testnet
# This script should be run ONCE after deploying the contract

CONTRACT_ADDRESS="0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac"

# Dummy backend public key (32 bytes of zeros)
# In production, replace with actual Ed25519 public key
BACKEND_PUBLIC_KEY="[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"

echo "Initializing VibeTrax contract..."
echo "Contract address: $CONTRACT_ADDRESS"
echo ""

movement move run \
  --function-id "${CONTRACT_ADDRESS}::vibetrax::initialize" \
  --args "u8:$BACKEND_PUBLIC_KEY"

echo ""
echo "Initialization complete!"
echo "The contract is now ready to mint NFTs."
