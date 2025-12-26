import { useState } from "react";
import { FiX, FiGift } from "react-icons/fi";
import styles from "./ClaimRewardsModal.module.css";
import { useAppContext } from "../../hooks/useAppContext";
import { useMusicActions } from "../../hooks/useMusicActions";
import { useStreamTracking } from "../../hooks/useStreamTracking";

const ClaimRewardsModal = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    unclaimedRewards,
    canClaimRewards: canClaim,
    isLoadingRewards: isCheckingEligibility,
  } = useAppContext();
  const { markRewardsClaimed } = useStreamTracking();
  const { claimStreamingRewards } = useMusicActions();

  const handleClaim = async () => {
    if (unclaimedRewards.tokensEarned === 0 || !canClaim) return;

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
            {!canClaim && (
              <p style={{ color: "#ff6b6b", marginTop: "0.5rem" }}>
                ⏱️ Please wait 1 hour since your last claim before claiming
                again.
              </p>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            <FiX />
          </button>
          <button
            className={styles.claimBtn}
            onClick={handleClaim}
            disabled={
              unclaimedRewards.tokensEarned === 0 ||
              isProcessing ||
              !canClaim ||
              isCheckingEligibility
            }
          >
            <FiGift />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimRewardsModal;
