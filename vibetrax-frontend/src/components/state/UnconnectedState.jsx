import { useState } from "react";
import styles from "./StateStyles.module.css";
import WalletModal from "../wallet/WalletModal";

export const UnconnectedState = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <div className={styles.stateContainer}>
      <h3 className={styles.stateTitle}>Wallet not connected</h3>
      <p className={styles.stateSubMessage}>
        Please Connect your wallet to access this page
      </p>
      <button
        className={styles.connectButton}
        onClick={() => setShowWalletModal(true)}
      >
        Connect Wallet
      </button>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
};
