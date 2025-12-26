import { useState } from "react";
import styles from "./ClaimRewardsModal.module.css";
import Button from "../../components/button/Button";
import { useStreamTracking } from "../../hooks/useStreamTracking";
import { useMusicActions } from "../../hooks/useMusicActions";

const ClaimRewardsModal = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { unclaimedRewards, markRewardsClaimed } = useStreamTracking();
  const { claimStreamingRewards } = useMusicActions();

  const handleClaim = async () => {
    if (unclaimedRewards.tokensEarned === 0) return;

    setIsProcessing(true);
    try {
      // Call smart contract to claim rewards
      const txHash = await claimStreamingRewards(
        unclaimedRewards.streams,
        unclaimedRewards.likes,
        unclaimedRewards.nftAddresses
      );

      if (txHash) {
        // Mark as claimed in Supabase
        await markRewardsClaimed(txHash);
        onClose();
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Claim Your Rewards</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.rewardsSummary}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Streams</span>
              <span className={styles.statValue}>
                {unclaimedRewards.streams}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Likes</span>
              <span className={styles.statValue}>{unclaimedRewards.likes}</span>
            </div>
            <div className={styles.totalTokens}>
              <span className={styles.totalLabel}>Total VIBE Tokens</span>
              <span className={styles.totalValue}>
                {unclaimedRewards.tokensEarned}
              </span>
            </div>
          </div>

          <div className={styles.rewardsBreakdown}>
            <p className={styles.breakdownItem}>
              {unclaimedRewards.streams} streams × 1 VIBE ={" "}
              {unclaimedRewards.streams} VIBE
            </p>
            <p className={styles.breakdownItem}>
              {unclaimedRewards.likes} likes × 2 VIBE ={" "}
              {unclaimedRewards.likes * 2} VIBE
            </p>
          </div>

          <div className={styles.note}>
            <p>
              💡 You can claim rewards once per hour. Your engagement data is
              tracked off-chain and verified on-chain during claims.
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleClaim}
            disabled={unclaimedRewards.tokensEarned === 0 || isProcessing}
          >
            {isProcessing ? "Claiming..." : "Claim Rewards"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClaimRewardsModal;
