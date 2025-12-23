import { useState } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { getAptosWallets } from "@aptos-labs/wallet-standard";
import { MOVEMENT_CONFIGS, CURRENT_NETWORK } from "../../config/movement";
import "./WalletModal.css";

function WalletModal({ isOpen, onClose, children }) {
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const { wallets, connect } = useWallet();
  const { authenticated, user } = usePrivy();
  const { createWallet } = useCreateWallet();

  // Check for Movement wallet
  const movementWallet = user?.linkedAccounts?.find(
    (account) => account.type === "wallet" && account.chainType === "aptos"
  );

  // Filter out unwanted wallets and sort with Nightly first
  const filteredWallets = wallets
    ?.filter((wallet) => {
      const name = wallet.name.toLowerCase();
      return (
        !name.includes("petra") &&
        !name.includes("google") &&
        !name.includes("apple")
      );
    })
    .filter((wallet, index, self) => {
      return index === self.findIndex((w) => w.name === wallet.name);
    })
    .sort((a, b) => {
      if (a.name.toLowerCase().includes("nightly")) return -1;
      if (b.name.toLowerCase().includes("nightly")) return 1;
      return 0;
    });

  const handleWalletSelect = async (walletName) => {
    try {
      if (typeof window !== "undefined") {
        const allWallets = getAptosWallets();
        const selectedWallet = allWallets.aptosWallets.find(
          (w) => w.name === walletName
        );

        if (selectedWallet?.features?.["aptos:connect"]) {
          const networkInfo = {
            chainId: MOVEMENT_CONFIGS[CURRENT_NETWORK].chainId,
            name: "custom",
            url: MOVEMENT_CONFIGS[CURRENT_NETWORK].fullnode,
          };

          try {
            const result = await selectedWallet.features[
              "aptos:connect"
            ].connect(false, networkInfo);
            if (result.status === "Approved") {
              await connect(walletName);
              onClose();
              return;
            }
          } catch {
            // Fallback to standard connection
          }
        }
      }

      await connect(walletName);
      onClose();
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const handleWalletCreation = async (user) => {
    try {
      setIsCreatingWallet(true);

      // Check if user already has an Aptos/Movement wallet
      const existingWallet = user?.linkedAccounts?.find(
        (account) => account.type === "wallet" && account.chainType === "aptos"
      );

      if (existingWallet) {
        console.log("Movement wallet already exists:", existingWallet.address);
        onClose();
        return existingWallet;
      }

      // Create a new Aptos/Movement wallet
      console.log("Creating new Movement wallet for user...");
      const wallet = await createWallet({ chainType: "aptos" });

      console.log("Movement wallet created successfully:", wallet.address);
      onClose();
      return wallet;
    } catch (error) {
      console.error("Wallet creation error:", error);
      throw error;
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const { login } = useLogin({
    onComplete: async ({ user }) => {
      try {
        await handleWalletCreation(user);
      } catch (error) {
        console.error("Error in login completion:", error);
        setIsCreatingWallet(false);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setIsCreatingWallet(false);
    },
  });

  const handlePrivyLogin = async () => {
    try {
      setIsCreatingWallet(true);

      if (!authenticated) {
        await login({
          loginMethods: ["email", "twitter", "google", "github", "discord"],
          prefill: { type: "email", value: "" },
          disableSignup: false,
        });
      } else {
        // User is already authenticated, just create wallet
        await handleWalletCreation(user);
      }
    } catch (error) {
      console.error("Privy login error:", error);
      setIsCreatingWallet(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div
        className="wallet-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="wallet-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="wallet-modal-header">
          <h2>Connect Wallet</h2>
          <p>Choose a wallet to connect to Movement Network</p>
        </div>

        <div className="wallet-modal-body">
          {/* Privy Social Login */}
          <div className="wallet-section">
            <h3>Login with Privy</h3>
            <p className="wallet-section-description">
              Secure social login with automatic wallet creation
            </p>

            <button
              className="wallet-btn wallet-btn-privy"
              onClick={handlePrivyLogin}
              disabled={isCreatingWallet || authenticated}
            >
              {isCreatingWallet ? (
                <span>
                  <span className="spinner"></span>
                  Setting up wallet...
                </span>
              ) : authenticated ? (
                "✓ Setup Movement Wallet"
              ) : (
                "Continue with Privy"
              )}
            </button>

            {authenticated && user && (
              <div className="wallet-status">
                <div className="wallet-status-authenticated">
                  <span className="status-dot status-green"></span>
                  <span>
                    Authenticated as:{" "}
                    {user.email?.address || user.phone?.number || "User"}
                  </span>
                </div>

                {movementWallet ? (
                  <div className="wallet-status-connected">
                    <span className="status-dot status-blue"></span>
                    <span>Movement Wallet Connected</span>
                    <div className="wallet-address">
                      {movementWallet.address?.slice(0, 6)}...
                      {movementWallet.address?.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <div className="wallet-status-warning">
                    <span className="status-dot status-orange"></span>
                    <span>Movement Wallet Not Created</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="wallet-divider">
            <span>OR</span>
          </div>

          {/* Native Wallet Options */}
          <div className="wallet-section">
            <h3>Connect Native Wallet</h3>
            <p className="wallet-section-description">
              Use your existing Aptos wallet
            </p>

            <div className="wallet-list">
              {filteredWallets?.length === 0 ? (
                <div className="wallet-empty">
                  <p>No wallets detected</p>
                  <p className="wallet-empty-help">
                    Please install a supported Aptos wallet like Nightly
                  </p>
                </div>
              ) : (
                filteredWallets?.map((wallet) => (
                  <button
                    key={wallet.name}
                    className="wallet-btn wallet-btn-native"
                    onClick={() => handleWalletSelect(wallet.name)}
                  >
                    {wallet.icon && (
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        className="wallet-icon"
                      />
                    )}
                    <span>{wallet.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default WalletModal;
