/**
 * Supabase Database Schema
 * 
 * Run these SQL commands in your Supabase SQL editor to create the tables:
 */

-- Streams tracking table
CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address TEXT NOT NULL,
    nft_address TEXT NOT NULL,
    stream_duration INTEGER NOT NULL, -- in seconds
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes tracking table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address TEXT NOT NULL,
    nft_address TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_address, nft_address) -- One like per user per track
);

-- Claims tracking table
CREATE TABLE IF NOT EXISTS reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address TEXT NOT NULL,
    streams_count INTEGER NOT NULL,
    likes_count INTEGER NOT NULL,
    tokens_earned INTEGER NOT NULL,
    transaction_hash TEXT,
    status TEXT DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_streams_user ON streams(user_address);
CREATE INDEX IF NOT EXISTS idx_streams_nft ON streams(nft_address);
CREATE INDEX IF NOT EXISTS idx_streams_claimed ON streams(claimed);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_address);
CREATE INDEX IF NOT EXISTS idx_likes_nft ON likes(nft_address);
CREATE INDEX IF NOT EXISTS idx_likes_claimed ON likes(claimed);
CREATE INDEX IF NOT EXISTS idx_claims_user ON reward_claims(user_address);
CREATE INDEX IF NOT EXISTS idx_claims_status ON reward_claims(status);

-- Note: RLS is disabled since we're using service role key for all operations
-- This allows the backend to read/write freely without auth complexity

/**
 * IMPORTANT: We do NOT store music NFT metadata in Supabase
 * NFT data is fetched directly from the blockchain using the contract's NFTRegistry
 * Only engagement data (streams, likes, claims) is stored in Supabase
 */
