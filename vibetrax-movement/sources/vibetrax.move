module vibetrax::vibetrax {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use aptos_framework::coin::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_std::ed25519;

    // ============================================================================
    // ERROR CONSTANTS
    // ============================================================================
    const EINSUFFICIENT_FUNDS: u64 = 1;
    const ENOT_AUTHORIZED: u64 = 2;
    const EINVALID_PRICE: u64 = 3;
    const EINVALID_ROYALTY: u64 = 4;
    const ENOT_FOR_SALE: u64 = 5;
    const EINVALID_SIGNATURE: u64 = 6;
    const ESPAM_DETECTED: u64 = 7;
    const EALREADY_CLAIMED: u64 = 8;
    const EINVALID_COLLABORATOR_SPLITS: u64 = 9;
    const ENO_REWARDS_TO_CLAIM: u64 = 10;
    const ENFT_NOT_FOUND: u64 = 11;
    const EINVALID_METADATA: u64 = 12;
    const ESUBSCRIPTION_EXPIRED: u64 = 13;
    const EINSUFFICIENT_TOKENS: u64 = 14;

    // ============================================================================
    // CONSTANTS
    // ============================================================================
    const STREAMS_PER_PRICE_INCREASE: u64 = 100;
    const LIKES_PER_PRICE_INCREASE: u64 = 200;
    const TIPS_PER_PRICE_INCREASE: u64 = 50;
    const PURCHASES_PER_PRICE_INCREASE: u64 = 10;
    
    const TOKEN_PER_STREAM: u64 = 1;
    const TOKEN_PER_LIKE: u64 = 2;
    const MIN_CLAIM_INTERVAL: u64 = 3600; // 1 hour in seconds (anti-spam)
    
    const BASIS_POINTS: u64 = 10000; // 100% = 10000 basis points
    
    // Subscription pricing
    const SUBSCRIPTION_PRICE_MOVE: u64 = 10_000_000; // 0.01 MOVE
    const SUBSCRIPTION_PRICE_TOKENS: u64 = 100; // 100 tokens
    const SUBSCRIPTION_DURATION: u64 = 2592000; // 30 days in seconds

    // ============================================================================
    // ENUMS (Move 2.0 Feature)
    // ============================================================================
    
    /// Payment event types using enums
    enum PaymentEvent has store, drop {
        Purchase { buyer: address, seller: address, amount: u64 },
        Tip { from: address, to: address, amount: u64 },
        Royalty { artist: address, amount: u64 },
    }

    /// NFT status
    enum NFTStatus has store, drop {
        Available,
        Sold,
        Delisted,
    }

    // ============================================================================
    // STRUCT DEFINITIONS
    // ============================================================================

    /// Platform token for rewards - using positional struct (Move 2.0)
    struct VibetraxToken(u64) has key;

    /// User token balance - positional struct
    struct TokenBalance(u64) has key;

    /// Music NFT with dynamic pricing
    struct MusicNFT has key, store {
        artist: address,
        current_owner: address,
        title: String,
        description: String,
        genre: String,
        music_art: String,
        high_quality_ipfs: String,
        low_quality_ipfs: String,
        
        // Pricing
        base_price: u64,
        current_price: u64,
        royalty_percentage: u64,
        
        // Engagement metrics
        streaming_count: u64,
        like_count: u64,
        tip_count: u64,
        purchase_count: u64,
        boost_count: u64, // New: promotion boosts
        total_boost_amount: u64, // Total tokens spent on boosts
        
        // Collaborators (separate from artist)
        collaborators: vector<address>,
        collaborator_roles: vector<String>,
        collaborator_splits: vector<u64>,
        
        status: NFTStatus,
        creation_time: u64,
        payment_history: vector<PaymentEvent>,
    }

    /// Global registry
    struct NFTRegistry has key {
        nft_addresses: vector<address>,
        nfts_by_artist: SmartTable<address, vector<address>>,
        nfts_by_genre: SmartTable<String, vector<address>>,
    }

    /// User claim tracking - positional for spam prevention
    struct UserClaimInfo has key {
        last_claim_time: u64,
        pending_streams: u64,
        pending_likes: u64,
        nonce: u64,
    }

    /// Subscription - positional struct
    struct Subscription(u64, bool) has key; // (expiry_time, is_active)

    /// Treasury
    struct Treasury(u64) has key; // balance

    /// Backend authority - positional
    struct BackendAuthority(vector<u8>) has key; // public_key

    // ============================================================================
    // EVENTS
    // ============================================================================

    #[event]
    struct MusicNFTMinted has drop, store {
        nft_address: address,
        artist: address,
        title: String,
        base_price: u64,
    }

    #[event]
    struct MusicNFTPurchased has drop, store {
        nft_address: address,
        buyer: address,
        seller: address,
        amount: u64,
        royalty_paid: u64,
    }

    #[event]
    struct RewardsClaimed has drop, store {
        user: address,
        streams: u64,
        likes: u64,
        tokens_earned: u64,
    }

    #[event]
    struct TipSent has drop, store {
        from: address,
        to: address,
        nft_address: address,
        amount: u64,
    }

    #[event]
    struct PriceUpdated has drop, store {
        nft_address: address,
        old_price: u64,
        new_price: u64,
        reason: String,
    }

    #[event]
    struct TokensMinted has drop, store {
        recipient: address,
        amount: u64,
    }

    #[event]
    struct SubscriptionPurchased has drop, store {
        user: address,
        payment_method: String, // "MOVE" or "TOKEN"
        amount: u64,
        expires_at: u64,
    }

    #[event]
    struct SubscriptionRenewed has drop, store {
        user: address,
        new_expiry: u64,
    }

    #[event]
    struct NFTBoosted has drop, store {
        nft_address: address,
        booster: address,
        amount: u64,
        new_boost_count: u64,
    }

    #[event]
    struct NFTDeleted has drop, store {
        nft_address: address,
        artist: address,
        title: String,
    }

    #[event]
    struct NFTUpdated has drop, store {
        nft_address: address,
        artist: address,
        updated_fields: String,
    }

    #[event]
    struct TreasuryWithdrawn has drop, store {
        admin: address,
        recipient: address,
        amount: u64,
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    /// Initialize platform
    public entry fun initialize(admin: &signer, backend_public_key: vector<u8>) {
        let _admin_addr = signer::address_of(admin);
        
        // Using positional struct syntax (Move 2.0)
        move_to(admin, VibetraxToken(0));
        move_to(admin, Treasury(0));
        move_to(admin, BackendAuthority(backend_public_key));
        
        move_to(admin, NFTRegistry {
            nft_addresses: vector::empty(),
            nfts_by_artist: smart_table::new(),
            nfts_by_genre: smart_table::new(),
        });
    }

    // ============================================================================
    // MUSIC NFT FUNCTIONS (with Move 2.0 receiver style)
    // ============================================================================

    /// Mint new music NFT
    public entry fun mint_music_nft(
        artist: &signer,
        title: vector<u8>,
        description: vector<u8>,
        genre: vector<u8>,
        music_art: vector<u8>,
        high_quality_ipfs: vector<u8>,
        low_quality_ipfs: vector<u8>,
        base_price: u64,
        royalty_percentage: u64,
        collaborators: vector<address>,
        collaborator_roles: vector<vector<u8>>,
        collaborator_splits: vector<u64>,
    ) acquires NFTRegistry {
        let artist_addr = signer::address_of(artist);
        
        assert!(base_price > 0, EINVALID_PRICE);
        assert!(royalty_percentage <= 5000, EINVALID_ROYALTY);
        assert!(vector::length(&high_quality_ipfs) > 0, EINVALID_METADATA);
        assert!(vector::length(&low_quality_ipfs) > 0, EINVALID_METADATA);
        
        // Validate collaborator splits using index notation (Move 2.0)
        if (vector::length(&collaborators) > 0) {
            assert!(
                vector::length(&collaborators) == vector::length(&collaborator_roles) &&
                vector::length(&collaborators) == vector::length(&collaborator_splits),
                EINVALID_METADATA
            );
            
            let total_split = 0u64;
            let i = 0;
            while (i < vector::length(&collaborator_splits)) {
                total_split += collaborator_splits[i]; // Index notation (Move 2.0)
                i += 1;
            };
            assert!(total_split == BASIS_POINTS, EINVALID_COLLABORATOR_SPLITS);
        };

        // Convert roles to strings
        let roles_string = vector::empty<String>();
        let i = 0;
        while (i < vector::length(&collaborator_roles)) {
            vector::push_back(&mut roles_string, string::utf8(collaborator_roles[i]));
            i += 1;
        };

        let genre_string = string::utf8(genre);
        let title_string = string::utf8(title);

        // Create NFT resource account
        let (nft_signer, _) = account::create_resource_account(artist, title);
        let nft_addr = signer::address_of(&nft_signer);

        let nft = MusicNFT {
            artist: artist_addr,
            current_owner: artist_addr,
            title: title_string,
            description: string::utf8(description),
            genre: genre_string,
            music_art: string::utf8(music_art),
            high_quality_ipfs: string::utf8(high_quality_ipfs),
            low_quality_ipfs: string::utf8(low_quality_ipfs),
            base_price,
            current_price: base_price,
            royalty_percentage,
            streaming_count: 0,
            like_count: 0,
            tip_count: 0,
            purchase_count: 0,
            boost_count: 0,
            total_boost_amount: 0,
            collaborators,
            collaborator_roles: roles_string,
            collaborator_splits,
            status: NFTStatus::Available,
            creation_time: timestamp::now_seconds(),
            payment_history: vector::empty(),
        };

        move_to(&nft_signer, nft);

        // Update registry
        let registry = &mut NFTRegistry[@vibetrax];
        vector::push_back(&mut registry.nft_addresses, nft_addr);
        
        // Add to artist's NFTs
        if (!smart_table::contains(&registry.nfts_by_artist, artist_addr)) {
            smart_table::add(&mut registry.nfts_by_artist, artist_addr, vector::empty());
        };
        let artist_nfts = smart_table::borrow_mut(&mut registry.nfts_by_artist, artist_addr);
        vector::push_back(artist_nfts, nft_addr);
        
        // Add to genre NFTs
        if (!smart_table::contains(&registry.nfts_by_genre, genre_string)) {
            smart_table::add(&mut registry.nfts_by_genre, genre_string, vector::empty());
        };
        let genre_nfts = smart_table::borrow_mut(&mut registry.nfts_by_genre, genre_string);
        vector::push_back(genre_nfts, nft_addr);

        event::emit(MusicNFTMinted {
            nft_address: nft_addr,
            artist: artist_addr,
            title: title_string,
            base_price,
        });
    }

    /// Purchase music NFT
    public entry fun purchase_music_nft(
        buyer: &signer,
        nft_address: address,
        payment_amount: u64,
    ) acquires MusicNFT {
        let buyer_addr = signer::address_of(buyer);
        
        // Register coin store if not already registered
        if (!coin::is_account_registered<AptosCoin>(buyer_addr)) {
            coin::register<AptosCoin>(buyer);
        };
        
        // Using bracket notation for resource access (Move 2.0)
        assert!(exists<MusicNFT>(nft_address), ENFT_NOT_FOUND);
        let nft = &mut MusicNFT[nft_address];
        
        // Check if for sale using receiver-style match (Move 2.0)
        match (&nft.status) {
            NFTStatus::Available => {},
            _ => abort ENOT_FOR_SALE,
        };
        
        assert!(payment_amount >= nft.current_price, EINSUFFICIENT_FUNDS);
        
        // Withdraw payment from buyer
        let payment = coin::withdraw<AptosCoin>(buyer, payment_amount);

        let seller = nft.current_owner;
        let artist = nft.artist;
        let is_initial_sale = (seller == artist);
        
        let royalty_paid = 0u64;
        
        if (is_initial_sale) {
            // Initial sale: collaborator splits
            let collaborator_total = 0u64;
            let i = 0;
            
            while (i < vector::length(&nft.collaborators)) {
                let collaborator = nft.collaborators[i]; // Index notation
                let split_percentage = nft.collaborator_splits[i];
                let collaborator_amount = (payment_amount * split_percentage) / BASIS_POINTS;
                
                if (collaborator_amount > 0) {
                    let collab_payment = coin::extract(&mut payment, collaborator_amount);
                    coin::deposit(collaborator, collab_payment);
                    collaborator_total += collaborator_amount;
                    
                    // Record payment using enum (Move 2.0)
                    vector::push_back(&mut nft.payment_history, PaymentEvent::Purchase {
                        buyer: buyer_addr,
                        seller: collaborator,
                        amount: collaborator_amount,
                    });
                };
                
                i += 1;
            };
            
            // Artist gets remainder
            let artist_amount = payment_amount - collaborator_total;
            if (artist_amount > 0) {
                let artist_payment = coin::extract(&mut payment, artist_amount);
                coin::deposit(artist, artist_payment);
            };
        } else {
            // Resale: seller + artist royalty
            let royalty_amount = (payment_amount * nft.royalty_percentage) / BASIS_POINTS;
            let seller_amount = payment_amount - royalty_amount;
            
            if (seller_amount > 0) {
                let seller_payment = coin::extract(&mut payment, seller_amount);
                coin::deposit(seller, seller_payment);
            };
            
            if (royalty_amount > 0) {
                let royalty_payment = coin::extract(&mut payment, royalty_amount);
                coin::deposit(artist, royalty_payment);
                royalty_paid = royalty_amount;
                
                // Record royalty using enum
                vector::push_back(&mut nft.payment_history, PaymentEvent::Royalty {
                    artist,
                    amount: royalty_amount,
                });
            };
        };
        
        // Handle dust
        if (coin::value(&payment) > 0) {
            coin::deposit(seller, payment);
        } else {
            coin::destroy_zero(payment);
        };
        
        // Update NFT state using compound assignments (Move 2.0)
        nft.current_owner = buyer_addr;
        nft.purchase_count += 1;
        nft.status = NFTStatus::Sold;
        
        // Update price
        nft.update_price_from_engagement(); // Receiver-style call

        event::emit(MusicNFTPurchased {
            nft_address,
            buyer: buyer_addr,
            seller,
            amount: payment_amount,
            royalty_paid,
        });
    }

    /// Tip artist with tokens (receiver-style)
    public entry fun tip_artist(
        tipper: &signer,
        nft_address: address,
        amount: u64,
    ) acquires TokenBalance, MusicNFT {
        let tipper_addr = signer::address_of(tipper);
        
        // Using bracket notation (Move 2.0)
        assert!(exists<TokenBalance>(tipper_addr), EINSUFFICIENT_FUNDS);
        let tipper_balance = &mut TokenBalance[tipper_addr];
        
        let TokenBalance(balance) = tipper_balance; // Positional destructuring
        assert!(*balance >= amount, EINSUFFICIENT_FUNDS);
        
        let nft = &mut MusicNFT[nft_address];
        let artist = nft.artist;
        
        // Deduct from tipper using compound assignment
        *balance -= amount;
        
        // Add to artist
        if (!exists<TokenBalance>(artist)) {
            // Artist will receive tokens when they initialize their account
            // For now, tokens are lost if artist hasn't initialized
            // In production, use a proper token account initialization
            abort EINSUFFICIENT_FUNDS
        };
        
        let artist_balance = &mut TokenBalance[artist];
        let TokenBalance(artist_bal) = artist_balance;
        *artist_bal += amount;
        
        // Update engagement
        nft.tip_count += 1;
        vector::push_back(&mut nft.payment_history, PaymentEvent::Tip {
            from: tipper_addr,
            to: artist,
            amount,
        });
        nft.update_price_from_engagement();

        event::emit(TipSent {
            from: tipper_addr,
            to: artist,
            nft_address,
            amount,
        });
    }

    // ============================================================================
    // REWARDS & CLAIMS (No acquires needed - Move 2.2)
    // ============================================================================

    /// Claim streaming rewards with backend verification
    public entry fun claim_streaming_rewards(
        user: &signer,
        streams: u64,
        likes: u64,
        nonce: u64,
        signature: vector<u8>,
        nft_addresses: vector<address>,
    ) acquires UserClaimInfo, BackendAuthority, TokenBalance, VibetraxToken, MusicNFT {
        let user_addr = signer::address_of(user);
        let current_time = timestamp::now_seconds();
        
        // Initialize claim info if needed
        if (!exists<UserClaimInfo>(user_addr)) {
            move_to(user, UserClaimInfo {
                last_claim_time: 0,
                pending_streams: 0,
                pending_likes: 0,
                nonce: 0,
            });
        };
        
        let claim_info = &mut UserClaimInfo[user_addr]; // Bracket notation
        
        // Anti-spam check
        assert!(
            current_time >= claim_info.last_claim_time + MIN_CLAIM_INTERVAL,
            ESPAM_DETECTED
        );
        
        // Prevent replay
        assert!(nonce > claim_info.nonce, EALREADY_CLAIMED);
        
        // Verify signature
        verify_backend_signature(user_addr, streams, likes, nonce, signature);
        
        // Calculate rewards
        let tokens_earned = (streams * TOKEN_PER_STREAM) + (likes * TOKEN_PER_LIKE);
        assert!(tokens_earned > 0, ENO_REWARDS_TO_CLAIM);
        
        // Mint tokens
        mint_tokens_to_user(user_addr, tokens_earned);
        
        // Update NFT engagement
        let i = 0;
        while (i < vector::length(&nft_addresses)) {
            let nft_addr = nft_addresses[i];
            if (exists<MusicNFT>(nft_addr)) {
                let nft = &mut MusicNFT[nft_addr];
                nft.streaming_count += streams;
                nft.like_count += likes;
                nft.update_price_from_engagement();
            };
            i += 1;
        };
        
        // Update claim info using compound assignments
        claim_info.last_claim_time = current_time;
        claim_info.nonce = nonce;
        claim_info.pending_streams = 0;
        claim_info.pending_likes = 0;

        event::emit(RewardsClaimed {
            user: user_addr,
            streams,
            likes,
            tokens_earned,
        });
    }

    // ============================================================================
    // RECEIVER-STYLE HELPER FUNCTIONS (Move 2.0)
    // ============================================================================

    /// Update NFT price from engagement (receiver-style)
    public fun update_price_from_engagement(self: &mut MusicNFT) {
        let old_price = self.current_price;
        
        let stream_increase = self.streaming_count / STREAMS_PER_PRICE_INCREASE;
        let like_increase = self.like_count / LIKES_PER_PRICE_INCREASE;
        let tip_increase = self.tip_count / TIPS_PER_PRICE_INCREASE;
        let purchase_increase = self.purchase_count / PURCHASES_PER_PRICE_INCREASE;
        
        self.current_price = self.base_price + stream_increase + like_increase + 
                            tip_increase + purchase_increase;
        
        if (self.current_price != old_price) {
            event::emit(PriceUpdated {
                nft_address: @vibetrax,
                old_price,
                new_price: self.current_price,
                reason: string::utf8(b"engagement_update"),
            });
        };
    }

    /// Get artist from NFT (receiver-style)
    public fun get_artist(self: &MusicNFT): address {
        self.artist
    }

    /// Get current price (receiver-style)
    public fun get_current_price(self: &MusicNFT): u64 {
        self.current_price
    }

    /// Check if NFT is for sale (receiver-style with pattern matching)
    public fun is_for_sale(self: &MusicNFT): bool {
        match (&self.status) {
            NFTStatus::Available => true,
            _ => false,
        }
    }

    // ============================================================================
    // SUBSCRIPTION FUNCTIONS
    // ============================================================================

    /// Purchase subscription with MOVE
    public entry fun subscribe_with_move(
        user: &signer,
        payment_amount: u64,
    ) acquires Treasury, Subscription {
        let user_addr = signer::address_of(user);
        
        assert!(payment_amount >= SUBSCRIPTION_PRICE_MOVE, EINSUFFICIENT_FUNDS);
        
        // Withdraw payment from user
        let payment = coin::withdraw<AptosCoin>(user, payment_amount);
        
        // Send payment to treasury
        let treasury = &mut Treasury[@vibetrax];
        let Treasury(balance) = treasury;
        *balance += payment_amount;
        coin::deposit(@vibetrax, payment);
        
        // Create or update subscription
        let expiry_time = timestamp::now_seconds() + SUBSCRIPTION_DURATION;
        
        if (exists<Subscription>(user_addr)) {
            let sub = &mut Subscription[user_addr];
            let Subscription(expiry, is_active) = sub;
            *expiry = expiry_time;
            *is_active = true;
        } else {
            move_to(user, Subscription(expiry_time, true));
        };

        event::emit(SubscriptionPurchased {
            user: user_addr,
            payment_method: string::utf8(b"MOVE"),
            amount: payment_amount,
            expires_at: expiry_time,
        });
    }

    /// Purchase subscription with tokens (alternative)
    public entry fun subscribe_with_tokens(user: &signer) acquires TokenBalance, VibetraxToken, Subscription {
        let user_addr = signer::address_of(user);
        
        assert!(exists<TokenBalance>(user_addr), EINSUFFICIENT_TOKENS);
        let user_balance = &mut TokenBalance[user_addr];
        let TokenBalance(balance) = user_balance;
        assert!(*balance >= SUBSCRIPTION_PRICE_TOKENS, EINSUFFICIENT_TOKENS);
        
        // Burn tokens
        *balance -= SUBSCRIPTION_PRICE_TOKENS;
        let token = &mut VibetraxToken[@vibetrax];
        let VibetraxToken(supply) = token;
        *supply -= SUBSCRIPTION_PRICE_TOKENS; // Remove from supply
        
        // Create or update subscription
        let expiry_time = timestamp::now_seconds() + SUBSCRIPTION_DURATION;
        
        if (exists<Subscription>(user_addr)) {
            let sub = &mut Subscription[user_addr];
            let Subscription(expiry, is_active) = sub;
            *expiry = expiry_time;
            *is_active = true;
        } else {
            move_to(user, Subscription(expiry_time, true));
        };

        event::emit(SubscriptionPurchased {
            user: user_addr,
            payment_method: string::utf8(b"TOKEN"),
            amount: SUBSCRIPTION_PRICE_TOKENS,
            expires_at: expiry_time,
        });
    }

    /// Check if user has premium access (subscription or ownership)
    public fun has_premium_access(nft_address: address, user: address): bool acquires MusicNFT, Subscription {
        let nft = &MusicNFT[nft_address];
        
        // Owner always has access
        if (nft.current_owner == user) {
            return true
        };
        
        // Check subscription
        if (exists<Subscription>(user)) {
            let Subscription(expiry, is_active) = &Subscription[user];
            if (*is_active && *expiry > timestamp::now_seconds()) {
                return true
            };
        };
        
        false
    }

    // ============================================================================
    // PACKAGE-LEVEL HELPER FUNCTIONS (Move 2.0)
    // ============================================================================

    /// Verify backend signature (package visibility)
    package fun verify_backend_signature(
        user: address,
        streams: u64,
        likes: u64,
        nonce: u64,
        signature: vector<u8>,
    ) acquires BackendAuthority {
        let authority = &BackendAuthority[@vibetrax];
        let BackendAuthority(public_key) = authority;
        
        // Construct message: user_address || streams || likes || nonce
        let message = vector::empty<u8>();
        
        // Add user address bytes (simplified - in production use proper serialization)
        let user_bytes = std::bcs::to_bytes(&user);
        vector::append(&mut message, user_bytes);
        
        // Add streams
        let streams_bytes = std::bcs::to_bytes(&streams);
        vector::append(&mut message, streams_bytes);
        
        // Add likes
        let likes_bytes = std::bcs::to_bytes(&likes);
        vector::append(&mut message, likes_bytes);
        
        // Add nonce
        let nonce_bytes = std::bcs::to_bytes(&nonce);
        vector::append(&mut message, nonce_bytes);
        
        // Verify signature
        let valid = ed25519::signature_verify_strict(
            &ed25519::new_signature_from_bytes(signature),
            &ed25519::new_unvalidated_public_key_from_bytes(*public_key),
            message
        );
        
        assert!(valid, EINVALID_SIGNATURE);
    }

    /// Mint tokens to user (package visibility)
    package fun mint_tokens_to_user(user: address, amount: u64) acquires TokenBalance, VibetraxToken {
        if (!exists<TokenBalance>(user)) {
            // User must initialize their token balance first
            // In production, auto-initialize or require explicit initialization
            abort EINSUFFICIENT_FUNDS
        };
        
        let balance = &mut TokenBalance[user];
        let TokenBalance(bal) = balance;
        *bal += amount;
        
        let token = &mut VibetraxToken[@vibetrax];
        let VibetraxToken(supply) = token;
        *supply += amount;

        event::emit(TokensMinted {
            recipient: user,
            amount,
        });
    }

    // ============================================================================
    // VIEW FUNCTIONS (receiver-style)
    // ============================================================================

    #[view]
    public fun get_nft_details(nft_address: address): (
        address, address, String, u64, u64, u64, u64, bool
    ) acquires MusicNFT {
        let nft = &MusicNFT[nft_address];
        (
            nft.get_artist(),
            nft.current_owner,
            nft.title,
            nft.base_price,
            nft.get_current_price(),
            nft.streaming_count,
            nft.like_count,
            nft.is_for_sale(),
        )
    }

    #[view]
    public fun get_token_balance(user: address): u64 acquires TokenBalance {
        if (!exists<TokenBalance>(user)) {
            return 0
        };
        let TokenBalance(balance) = &TokenBalance[user];
        *balance
    }

    #[view]
    public fun get_low_quality_link(nft_address: address): String acquires MusicNFT {
        let nft = &MusicNFT[nft_address];
        nft.low_quality_ipfs
    }

    #[view]
    public fun get_high_quality_link(nft_address: address, user: address): Option<String> acquires MusicNFT, Subscription {
        let nft = &MusicNFT[nft_address];
        
        if (nft.current_owner == user) {
            return option::some(nft.high_quality_ipfs)
        };
        
        if (exists<Subscription>(user)) {
            let Subscription(expiry, is_active) = &Subscription[user];
            if (*is_active && *expiry > timestamp::now_seconds()) {
                return option::some(nft.high_quality_ipfs)
            };
        };
        
        option::none()
    }

    #[view]
    public fun can_claim_rewards(user: address): bool acquires UserClaimInfo {
        if (!exists<UserClaimInfo>(user)) {
            return true
        };
        
        let claim_info = &UserClaimInfo[user];
        let current_time = timestamp::now_seconds();
        
        current_time >= claim_info.last_claim_time + MIN_CLAIM_INTERVAL
    }

    #[view]
    public fun is_subscribed(user: address): bool acquires Subscription {
        if (!exists<Subscription>(user)) {
            return false
        };
        
        let Subscription(expiry, is_active) = &Subscription[user];
        *is_active && *expiry > timestamp::now_seconds()
    }

    #[view]
    public fun get_all_nfts(): vector<address> acquires NFTRegistry {
        let registry = &NFTRegistry[@vibetrax];
        registry.nft_addresses
    }

    #[view]
    public fun get_nfts_by_artist(artist: address): vector<address> acquires NFTRegistry {
        let registry = &NFTRegistry[@vibetrax];
        if (smart_table::contains(&registry.nfts_by_artist, artist)) {
            *smart_table::borrow(&registry.nfts_by_artist, artist)
        } else {
            vector::empty()
        }
    }

    #[view]
    public fun get_nfts_by_genre(genre: String): vector<address> acquires NFTRegistry {
        let registry = &NFTRegistry[@vibetrax];
        if (smart_table::contains(&registry.nfts_by_genre, genre)) {
            *smart_table::borrow(&registry.nfts_by_genre, genre)
        } else {
            vector::empty()
        }
    }

    #[view]
    public fun get_treasury_balance(): u64 acquires Treasury {
        let Treasury(balance) = &Treasury[@vibetrax];
        *balance
    }

    // ============================================================================
    // BOOST/PROMOTION SYSTEM
    // ============================================================================

    /// Boost a song to increase visibility
    public entry fun boost_song(
        booster: &signer,
        nft_address: address,
        amount: u64,
    ) acquires TokenBalance, VibetraxToken, MusicNFT {
        let booster_addr = signer::address_of(booster);
        
        assert!(exists<TokenBalance>(booster_addr), EINSUFFICIENT_TOKENS);
        let booster_balance = &mut TokenBalance[booster_addr];
        let TokenBalance(balance) = booster_balance;
        assert!(*balance >= amount, EINSUFFICIENT_TOKENS);
        assert!(amount > 0, EINSUFFICIENT_TOKENS);
        
        // Deduct tokens from booster
        *balance -= amount;
        
        // Burn 50% of boost tokens (deflationary)
        let burn_amount = amount / 2;
        let artist_amount = amount - burn_amount;
        
        // Reduce total supply
        let token = &mut VibetraxToken[@vibetrax];
        let VibetraxToken(supply) = token;
        *supply -= burn_amount;
        
        // Give 50% to artist
        let nft = &mut MusicNFT[nft_address];
        let artist = nft.artist;
        
        if (!exists<TokenBalance>(artist)) {
            // Artist must have initialized their token balance
            // Tokens are burned if artist hasn't initialized
            abort EINSUFFICIENT_FUNDS
        };
        
        let artist_balance = &mut TokenBalance[artist];
        let TokenBalance(artist_bal) = artist_balance;
        *artist_bal += artist_amount;
        
        // Update NFT boost metrics
        nft.boost_count += 1;
        nft.total_boost_amount += amount;

        event::emit(NFTBoosted {
            nft_address,
            booster: booster_addr,
            amount,
            new_boost_count: nft.boost_count,
        });
    }

    // ============================================================================
    // DISCOVERY FUNCTIONS
    // ============================================================================

    #[view]
    public fun get_trending_nfts(limit: u64): vector<address> acquires NFTRegistry, MusicNFT {
        let registry = &NFTRegistry[@vibetrax];
        let all_nfts = registry.nft_addresses;
        
        // Calculate engagement scores - use parallel arrays
        let addresses = vector::empty<address>();
        let scores = vector::empty<u64>();
        let i = 0;
        
        while (i < vector::length(&all_nfts)) {
            let nft_addr = all_nfts[i];
            if (exists<MusicNFT>(nft_addr)) {
                let nft = &MusicNFT[nft_addr];
                // Engagement score: streams + (likes * 2) + (boosts * 10) + (purchases * 20)
                let score = nft.streaming_count + 
                           (nft.like_count * 2) + 
                           (nft.total_boost_amount * 10) + 
                           (nft.purchase_count * 20);
                vector::push_back(&mut addresses, nft_addr);
                vector::push_back(&mut scores, score);
            };
            i += 1;
        };
        
        // Simple bubble sort (descending by score) - sort both arrays in parallel
        let len = vector::length(&scores);
        let i = 0;
        while (i < len) {
            let j = 0;
            while (j < len - i - 1) {
                if (scores[j] < scores[j + 1]) {
                    // Swap scores
                    let temp_score = scores[j];
                    scores[j] = scores[j + 1];
                    scores[j + 1] = temp_score;
                    // Swap addresses
                    let temp_addr = addresses[j];
                    addresses[j] = addresses[j + 1];
                    addresses[j + 1] = temp_addr;
                };
                j += 1;
            };
            i += 1;
        };
        
        // Extract top addresses
        let result = vector::empty<address>();
        let i = 0;
        let max = if (limit < len) { limit } else { len };
        while (i < max) {
            vector::push_back(&mut result, addresses[i]);
            i += 1;
        };
        
        result
    }

    #[view]
    public fun get_newest_nfts(limit: u64): vector<address> acquires NFTRegistry, MusicNFT {
        let registry = &NFTRegistry[@vibetrax];
        let all_nfts = registry.nft_addresses;
        
        let addresses = vector::empty<address>();
        let times = vector::empty<u64>();
        let i = 0;
        
        while (i < vector::length(&all_nfts)) {
            let nft_addr = all_nfts[i];
            if (exists<MusicNFT>(nft_addr)) {
                let nft = &MusicNFT[nft_addr];
                vector::push_back(&mut addresses, nft_addr);
                vector::push_back(&mut times, nft.creation_time);
            };
            i += 1;
        };
        
        // Sort by creation time (descending - newest first)
        let len = vector::length(&times);
        let i = 0;
        while (i < len) {
            let j = 0;
            while (j < len - i - 1) {
                if (times[j] < times[j + 1]) {
                    // Swap times
                    let temp_time = times[j];
                    times[j] = times[j + 1];
                    times[j + 1] = temp_time;
                    // Swap addresses
                    let temp_addr = addresses[j];
                    addresses[j] = addresses[j + 1];
                    addresses[j + 1] = temp_addr;
                };
                j += 1;
            };
            i += 1;
        };
        
        let result = vector::empty<address>();
        let i = 0;
        let max = if (limit < len) { limit } else { len };
        while (i < max) {
            vector::push_back(&mut result, addresses[i]);
            i += 1;
        };
        
        result
    }

    #[view]
    public fun get_most_streamed_nfts(limit: u64): vector<address> acquires NFTRegistry, MusicNFT {
        let registry = &NFTRegistry[@vibetrax];
        let all_nfts = registry.nft_addresses;
        
        let addresses = vector::empty<address>();
        let streams = vector::empty<u64>();
        let i = 0;
        
        while (i < vector::length(&all_nfts)) {
            let nft_addr = all_nfts[i];
            if (exists<MusicNFT>(nft_addr)) {
                let nft = &MusicNFT[nft_addr];
                vector::push_back(&mut addresses, nft_addr);
                vector::push_back(&mut streams, nft.streaming_count);
            };
            i += 1;
        };
        
        // Sort by streams (descending)
        let len = vector::length(&streams);
        let i = 0;
        while (i < len) {
            let j = 0;
            while (j < len - i - 1) {
                if (streams[j] < streams[j + 1]) {
                    // Swap streams
                    let temp_stream = streams[j];
                    streams[j] = streams[j + 1];
                    streams[j + 1] = temp_stream;
                    // Swap addresses
                    let temp_addr = addresses[j];
                    addresses[j] = addresses[j + 1];
                    addresses[j + 1] = temp_addr;
                };
                j += 1;
            };
            i += 1;
        };
        
        let result = vector::empty<address>();
        let i = 0;
        let max = if (limit < len) { limit } else { len };
        while (i < max) {
            vector::push_back(&mut result, addresses[i]);
            i += 1;
        };
        
        result
    }

    // ============================================================================
    // NFT UPDATE & DELETION
    // ============================================================================

    /// Update NFT metadata (artist only)
    public entry fun update_nft_metadata(
        artist: &signer,
        nft_address: address,
        new_title: vector<u8>,
        new_description: vector<u8>,
        new_music_art: vector<u8>,
    ) acquires MusicNFT {
        let artist_addr = signer::address_of(artist);
        let nft = &mut MusicNFT[nft_address];
        
        assert!(nft.artist == artist_addr, ENOT_AUTHORIZED);
        
        let updated_fields = string::utf8(b"");
        
        if (vector::length(&new_title) > 0) {
            nft.title = string::utf8(new_title);
            string::append(&mut updated_fields, string::utf8(b"title,"));
        };
        
        if (vector::length(&new_description) > 0) {
            nft.description = string::utf8(new_description);
            string::append(&mut updated_fields, string::utf8(b"description,"));
        };
        
        if (vector::length(&new_music_art) > 0) {
            nft.music_art = string::utf8(new_music_art);
            string::append(&mut updated_fields, string::utf8(b"art,"));
        };

        event::emit(NFTUpdated {
            nft_address,
            artist: artist_addr,
            updated_fields,
        });
    }

    /// Update NFT files (artist only)
    public entry fun update_nft_files(
        artist: &signer,
        nft_address: address,
        new_high_quality_ipfs: vector<u8>,
        new_low_quality_ipfs: vector<u8>,
    ) acquires MusicNFT {
        let artist_addr = signer::address_of(artist);
        let nft = &mut MusicNFT[nft_address];
        
        assert!(nft.artist == artist_addr, ENOT_AUTHORIZED);
        
        if (vector::length(&new_high_quality_ipfs) > 0) {
            nft.high_quality_ipfs = string::utf8(new_high_quality_ipfs);
        };
        
        if (vector::length(&new_low_quality_ipfs) > 0) {
            nft.low_quality_ipfs = string::utf8(new_low_quality_ipfs);
        };

        event::emit(NFTUpdated {
            nft_address,
            artist: artist_addr,
            updated_fields: string::utf8(b"ipfs_files"),
        });
    }

    /// Delete NFT (artist only, must be current owner)
    public entry fun delete_nft(
        artist: &signer,
        nft_address: address,
    ) acquires MusicNFT, NFTRegistry {
        let artist_addr = signer::address_of(artist);
        
        assert!(exists<MusicNFT>(nft_address), ENFT_NOT_FOUND);
        let nft = move_from<MusicNFT>(nft_address);
        
        // Artist must be current owner (unsold)
        assert!(nft.artist == artist_addr, ENOT_AUTHORIZED);
        assert!(nft.current_owner == artist_addr, ENOT_AUTHORIZED);
        
        let title = nft.title;
        
        // Remove from registry
        let registry = &mut NFTRegistry[@vibetrax];
        
        // Remove from all_nfts
        let i = 0;
        while (i < vector::length(&registry.nft_addresses)) {
            if (registry.nft_addresses[i] == nft_address) {
                vector::remove(&mut registry.nft_addresses, i);
                break
            };
            i += 1;
        };
        
        // Remove from artist's NFTs
        if (smart_table::contains(&registry.nfts_by_artist, artist_addr)) {
            let artist_nfts = smart_table::borrow_mut(&mut registry.nfts_by_artist, artist_addr);
            let i = 0;
            while (i < vector::length(artist_nfts)) {
                if (artist_nfts[i] == nft_address) {
                    vector::remove(artist_nfts, i);
                    break
                };
                i += 1;
            };
        };
        
        // Remove from genre NFTs
        if (smart_table::contains(&registry.nfts_by_genre, nft.genre)) {
            let genre_nfts = smart_table::borrow_mut(&mut registry.nfts_by_genre, nft.genre);
            let i = 0;
            while (i < vector::length(genre_nfts)) {
                if (genre_nfts[i] == nft_address) {
                    vector::remove(genre_nfts, i);
                    break
                };
                i += 1;
            };
        };

        event::emit(NFTDeleted {
            nft_address,
            artist: artist_addr,
            title,
        });
        
        // Destroy NFT
        let MusicNFT {
            artist: _,
            current_owner: _,
            title: _,
            description: _,
            genre: _,
            music_art: _,
            high_quality_ipfs: _,
            low_quality_ipfs: _,
            base_price: _,
            current_price: _,
            royalty_percentage: _,
            streaming_count: _,
            like_count: _,
            tip_count: _,
            purchase_count: _,
            boost_count: _,
            total_boost_amount: _,
            collaborators: _,
            collaborator_roles: _,
            collaborator_splits: _,
            status: _,
            creation_time: _,
            payment_history: _,
        } = nft;
    }

    // ============================================================================
    // TREASURY MANAGEMENT
    // ============================================================================

    /// Withdraw from treasury (admin only)
    public entry fun withdraw_from_treasury(
        admin: &signer,
        recipient: address,
        amount: u64,
    ) acquires Treasury {
        let admin_addr = signer::address_of(admin);
        // Simple admin check - in production, use proper access control
        assert!(admin_addr == @vibetrax, ENOT_AUTHORIZED);
        
        let treasury = &mut Treasury[@vibetrax];
        let Treasury(balance) = treasury;
        assert!(*balance >= amount, EINSUFFICIENT_FUNDS);
        
        *balance -= amount;
        
        // Transfer MOVE coins to recipient
        let withdrawal = coin::withdraw<AptosCoin>(admin, amount);
        coin::deposit(recipient, withdrawal);

        event::emit(TreasuryWithdrawn {
            admin: admin_addr,
            recipient,
            amount,
        });
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    public entry fun toggle_for_sale(owner: &signer, nft_address: address) acquires MusicNFT {
        let owner_addr = signer::address_of(owner);
        let nft = &mut MusicNFT[nft_address];
        assert!(nft.current_owner == owner_addr, ENOT_AUTHORIZED);
        
        // Toggle status using pattern matching
        nft.status = match (&nft.status) {
            NFTStatus::Available => NFTStatus::Delisted,
            _ => NFTStatus::Available,
        };
    }

    public entry fun update_base_price(owner: &signer, nft_address: address, new_price: u64) acquires MusicNFT {
        let owner_addr = signer::address_of(owner);
        let nft = &mut MusicNFT[nft_address];
        assert!(nft.current_owner == owner_addr, ENOT_AUTHORIZED);
        assert!(new_price > 0, EINVALID_PRICE);
        nft.base_price = new_price;
        nft.update_price_from_engagement();
    }
}
