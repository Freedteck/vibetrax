import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletModal } from "../wallet/WalletModal";
import { getTransactionSubmitter, fetchViewFunction } from "../../utils/transactions";
import { getAddressExplorerUrl } from "../../config/movement";
import "./WalletDemo.css";

/**
 * Example component demonstrating how to use Privy + Native wallet integration
 * with Movement blockchain transactions
 */
export function WalletDemo() {
  const { authenticated, user, logout } = usePrivy();
  const { account, connected, disconnect, signAndSubmitTransaction } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  // Note: signRawHash needs proper implementation with useSignRawHash hook
  // For now, set to null - implement properly in production
  const signRawHash = null;

  // Determine wallet address
  useEffect(() => {
    if (authenticated && user) {
      const moveWallet = user.linkedAccounts?.find(
        (acc) => acc.chainType === "aptos"
      );
      if (moveWallet) {
        setWalletAddress(moveWallet.address);
      }
    } else if (connected && account) {
      setWalletAddress(account.address.toString());
    } else {
      setWalletAddress("");
    }
  }, [authenticated, user, connected, account]);

  const handleDisconnect = async () => {
    if (authenticated) {
      await logout();
    } else if (connected) {
      await disconnect();
    }
  };

  // Example: Mint NFT transaction
  const handleMintNFT = async () => {
    try {
      setIsLoading(true);
      setTxHash("");

      // Example NFT metadata
      const name = "My Awesome Track";
      const description = "This is a demo track";
      const basePrice = 1000000; // 0.01 MOVE (assuming 8 decimals)
      const royaltyPercentage = 10; // 10%
      const metadataUri = "ipfs://example-metadata-uri";
      const audioUri = "ipfs://example-audio-uri";
      const imageUri = "ipfs://example-image-uri";
      const collaborators = []; // Empty for demo
      const collaboratorSplits = []; // Empty for demo

      // Get the appropriate transaction submitter
      const { submitTransaction } = getTransactionSubmitter(
        user,
        account,
        signRawHash,
        signAndSubmitTransaction
      );

      // Submit transaction
      const hash = await submitTransaction("mint_music_nft", [
        name,
        description,
        basePrice,
        royaltyPercentage,
        metadataUri,
        audioUri,
        imageUri,
        collaborators,
        collaboratorSplits,
      ]);

      setTxHash(hash);
      alert(`NFT minted successfully! Tx: ${hash}`);
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Read NFT registry count
  const handleReadRegistry = async () => {
    try {
      setIsLoading(true);
      const result = await fetchViewFunction("get_nft_count", []);
      alert(`Total NFTs in registry: ${result?.[0] || 0}`);
    } catch (error) {
      console.error("Error reading registry:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = authenticated || connected;
  const walletType = authenticated ? "Privy" : connected ? "Native" : "None";

  return (
    <div className="wallet-demo">
      <div className="wallet-demo-card">
        <h2>Wallet Integration Demo</h2>
        <p className="wallet-demo-description">
          Example of Privy social login + native Aptos wallet integration with Movement blockchain
        </p>

        {!isConnected ? (
          <div className="wallet-demo-connect">
            <button
              className="demo-btn demo-btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Connect Wallet
            </button>
            <p className="wallet-demo-hint">
              Connect with Privy (social login) or native Aptos wallet (Nightly, etc.)
            </p>
          </div>
        ) : (
          <div className="wallet-demo-connected">
            <div className="wallet-info">
              <div className="wallet-info-row">
                <span className="wallet-info-label">Wallet Type:</span>
                <span className={`wallet-type-badge ${walletType.toLowerCase()}`}>
                  {walletType}
                </span>
              </div>
              <div className="wallet-info-row">
                <span className="wallet-info-label">Address:</span>
                <a
                  href={getAddressExplorerUrl(walletAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wallet-address-link"
                >
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </a>
              </div>
            </div>

            <div className="wallet-actions">
              <h3>Demo Actions</h3>
              
              <button
                className="demo-btn demo-btn-action"
                onClick={handleMintNFT}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Mint NFT (Demo)"}
              </button>

              <button
                className="demo-btn demo-btn-action"
                onClick={handleReadRegistry}
                disabled={isLoading}
              >
                Read NFT Count
              </button>

              <button
                className="demo-btn demo-btn-disconnect"
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>

            {txHash && (
              <div className="tx-result">
                <p>✓ Transaction successful!</p>
                <a
                  href={`https://explorer.movementnetwork.xyz/txn/${txHash}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  View on Explorer
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
