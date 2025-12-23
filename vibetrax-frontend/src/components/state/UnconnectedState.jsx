import { useState } from "react";
import styles from "./StateStyles.module.css";
import WalletModal from "../wallet/WalletModal";
import Button from "../button/Button";

export const UnconnectedState = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <div className={styles.stateContainer}>
      <h3 className={styles.stateTitle}>Wallet not connected</h3>
      <p className={styles.stateSubMessage}>
        Please Connect your wallet to access this page
      </p>
      <Button
        btnClass="primary"
        text={"Connect Wallet"}
        onClick={() => setShowWalletModal(true)}
      />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
};
