# 🎵 VibeTrax

**A Modern Decentralized Music Streaming Platform**

Stream, own, and trade music on the blockchain. Experience the future of music with transparent royalties, artist collaboration, and true ownership.

---

## 🌟 Overview

VibeTrax is a **Web3 music streaming application** built on the **Movement blockchain**, combining the familiar experience of modern music streaming platforms like Spotify with the revolutionary power of blockchain technology.

Artists can upload music, collaborate with others, and receive **instant on-chain payments**. Fans can stream music, purchase tracks as NFTs, earn rewards, and truly own their music collection—all while supporting artists directly.

---

## ✨ Core Features

### 🎨 **Modern Music Streaming Experience**

- **Spotify-Inspired Interface** – Dark theme, sidebar navigation, persistent bottom player
- **Browse & Discover** – Featured carousel, genre filters, trending tracks
- **Search Functionality** – Find songs and artists instantly
- **Responsive Design** – Seamless experience across desktop, tablet, and mobile

### 🎵 **For Artists**

- **No Upfront Capital** – Upload music and share revenue with collaborators
- **On-Chain Revenue Splitting** – Automatic payments to all contributors
- **Collaborator Management** – Set revenue splits and roles for each contributor
- **Artist Analytics** – Track likes, plays, and earnings in real-time
- **Dynamic Pricing** – Set your own prices and royalty percentages

### 🎧 **For Listeners**

- **Free Streaming** – Listen to all tracks at standard quality (128kbps)
- **Premium Upgrade** – Subscribe for high-fidelity audio (320kbps)
- **NFT Ownership** – Buy tracks to support artists and own music NFTs
- **Like & Vote System** – Support favorite tracks and influence trending lists
- **Token Rewards** – Earn rewards for streaming and engagement

### ⛓️ **Blockchain Features**

- **Web3 Wallet Integration** – Privy authentication + native Movement wallets
- **Token Economy** – Platform tokens for purchases and rewards
- **Smart Contracts** – Transparent, automated royalty distribution
- **NFT Marketplace** – Buy, own, and trade music NFTs
- **On-Chain Subscriptions** – Premium memberships managed on-chain

---

## 🛠️ Tech Stack

| Layer                  | Technology                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| **Blockchain**         | [Movement](https://movementlabs.xyz) (Aptos-based, Move language) |
| **Frontend**           | React.js + Vite                                                   |
| **Styling**            | CSS Modules (Modern Spotify-inspired design)                      |
| **Wallet Integration** | Privy Auth + Aptos Wallet Adapter                                 |
| **Storage**            | Pinata IPFS (audio files & artwork)                               |
| **Authentication**     | Privy.io (Web3 authentication)                                    |
| **State Management**   | React Context API                                                 |
| **Icons**              | React Icons (Feather Icons)                                       |
| **Avatars**            | React Jazzicon                                                    |
| **Notifications**      | React Hot Toast                                                   |
| **Routing**            | React Router v6                                                   |
| **Smart Contracts**    | Move language on Movement blockchain                              |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)
- A Web3 wallet (Petra, Martian, or use Privy's embedded wallet)
- [Pinata Account](https://app.pinata.cloud/) (for IPFS storage)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Freedteck/vibetrax.git
   cd vibetrax
   ```

2. **Navigate to the frontend directory:**

   ```bash
   cd vibetrax-frontend
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Set up environment variables:**

   Create a `.env` file in the `vibetrax-frontend` directory:

   ```env
   # Pinata Configuration
   VITE_PINATA_JWT=your_pinata_jwt_token
   VITE_PINATA_GATEWAY=your_pinata_gateway_url

   # Privy Configuration
   VITE_PRIVY_APP_ID=your_privy_app_id

   # Movement Blockchain Configuration
   VITE_MOVEMENT_NETWORK=testnet
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Smart Contract Deployment

1. **Navigate to the smart contract directory:**

   ```bash
   cd vibetrax-v2
   ```

2. **Build the Move contract:**

   ```bash
   movement move compile
   ```

3. **Deploy to Movement testnet:**

   ```bash
   movement move publish
   ```

4. **Update the contract address in your `.env` file**

---

## 🎯 Key Features Walkthrough

### **Home Page**

- Trending tracks based on likes
- Recently added music
- Popular albums
- Featured artists
- Personalized recommendations

### **Browse/Discover**

- Hero carousel with featured tracks
- Filter by: All, Songs, Albums
- Genre filtering (Pop, HipHop, R&B, Rock, Electronic, Jazz, Classical, Afrobeat, Latin)
- Search functionality with real-time results

### **Now Playing**

- Large album artwork with vinyl animation
- Full track details and metadata
- Buy NFT or subscribe to premium
- View collaborators and revenue splits
- More tracks from the same artist

### **Artist Profile**

- User avatar and stats
- Uploaded tracks showcase
- Owned NFTs collection
- Token balance (for own profile)
- Upload new music button

### **Player Controls**

- Persistent bottom player bar
- Play/pause, skip, shuffle, repeat
- Volume control
- Progress bar with seek
- Like button
- Full-screen player view

---

## 📱 Application Structure

```
vibetrax-frontend/
├── src/
│   ├── components/
│   │   ├── sidebar/          # Main navigation
│   │   ├── header/           # Top bar with search
│   │   ├── now-playing-bar/  # Bottom player
│   │   ├── cards/            # Music cards
│   │   ├── wallet/           # Wallet connection
│   │   └── modals/           # Various modals
│   ├── routes/
│   │   ├── home/             # Landing page
│   │   ├── discover/         # Browse music
│   │   ├── profile/          # Artist/User profile
│   │   ├── music-player/     # Now playing view
│   │   └── upload-music/     # Upload interface
│   ├── hooks/
│   │   ├── useMovementWallet.jsx    # Wallet integration
│   │   ├── useMusicNfts.jsx         # Fetch music data
│   │   ├── useMusicActions.jsx      # Like, buy, upload
│   │   ├── useAppContext.jsx        # Global state
│   │   └── useStreamTracking.jsx    # Track streams
│   └── modals/
│       ├── buy-tokens-modal/
│       ├── claim-rewards-modal/
│       └── premium-modal/
```

---

## 🔐 Wallet Integration

VibeTrax supports multiple wallet types:

- **Privy Embedded Wallets** – Easy onboarding for Web2 users
- **Petra Wallet** – Official Aptos wallet
- **Martian Wallet** – Multi-chain support
- **Native Movement Wallets** – Direct blockchain connection

---

## 💰 Token Economy

- **Platform Tokens** – Used for purchases and subscriptions
- **Rewards System** – Earn tokens for streaming and engagement
- **Staking (Coming Soon)** – Stake tokens for premium benefits
- **Governance (Planned)** – Vote on platform decisions

---

## 🎨 Design Philosophy

VibeTrax combines the best of Web2 and Web3:

- **Familiar UX** – Spotify-inspired interface that users love
- **Web3 Power** – True ownership, transparent royalties, direct artist support
- **Dark Theme** – Easy on the eyes for long listening sessions
- **Responsive** – Beautiful on every device
- **Fast & Smooth** – Optimized performance with modern React

---

## 📊 Project Status

✅ **Completed:**

- Modern music streaming UI/UX
- Movement blockchain integration
- Wallet authentication (Privy + Native)
- Music upload & NFT minting
- Like/Vote system
- Premium subscription logic
- Token rewards system
- Artist collaboration features
- Responsive mobile design

🚧 **In Progress:**

- Enhanced analytics dashboard
- Playlist creation
- Social features (comments, sharing)
- Advanced search filters

🔮 **Planned:**

- Mobile apps (iOS/Android)
- Artist verification system
- Live streaming concerts
- DAO governance
- Cross-chain support

---

## 🤝 Contributing

We're building the future of music with the community! Contributions are welcome from:

- **Blockchain Developers** – Move language, smart contract optimization
- **Frontend Developers** – React, UI/UX improvements
- **Designers** – Interface design, user experience
- **Music Enthusiasts** – Feature ideas, testing, feedback
- **Content Creators** – Documentation, tutorials, demos

### How to Contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔗 Links

- **Live Application:** [https://vibetrax-blue.vercel.app/](https://vibetrax-blue.vercel.app/)
- **GitHub Repository:** [https://github.com/Freedteck/vibetrax](https://github.com/Freedteck/vibetrax)
- **Movement Blockchain:** [movementlabs.xyz](https://movementlabs.xyz)
- **Documentation:** Coming soon

---

## 👥 Team

Built with ❤️ by passionate developers who believe in the future of decentralized music.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Movement Labs for the blockchain infrastructure
- Privy for Web3 authentication
- Pinata for IPFS storage
- The open-source community for amazing tools and libraries

---

## 📞 Support

For questions, issues, or feature requests:

- Open an issue on [GitHub](https://github.com/Freedteck/vibetrax/issues)
- Join our community discussions
- Contact the team

---

**Built for artists. Powered by blockchain. Designed for everyone.**

🎵 **VibeTrax** - _Where Music Meets Web3_
