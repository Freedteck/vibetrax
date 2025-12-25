import React, { useState, useEffect } from "react";
import styles from "./BoostSongModal.module.css";
import Button from "../../components/button/Button";
import { useMusicActions } from "../../hooks/useMusicActions";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import BuyTokensModal from "../buy-tokens-modal/BuyTokensModal";
import {
  FiX,
  FiZap,
  FiTrendingUp,
  FiCheck,
  FiAlertTriangle,
  FiTarget,
  FiAward,
  FiShoppingBag,
} from "react-icons/fi";

const BoostSongModal = ({
  isOpen,
  onClose,
  nftId,
  songTitle,
  currentBoostCount,
}) => {
  const [boostAmount, setBoostAmount] = useState("");
  const [boostStatus, setBoostStatus] = useState("idle");
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const { boostSong } = useMusicActions();
  const { tokenBalance } = useTokenBalance();

  const presetAmounts = [10, 50, 100, 250, 500];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBoost = async () => {
    const amount = parseInt(boostAmount);
    if (!amount || amount <= 0) {
      setBoostStatus("error");
      return;
    }

    if (amount > tokenBalance) {
      setBoostStatus("insufficient");
      return;
    }

    setBoostStatus("processing");
    try {
      const success = await boostSong(nftId, amount);
      if (success) {
        setBoostStatus("success");
        setTimeout(() => {
          onClose();
          setBoostAmount("");
          setBoostStatus("idle");
        }, 2000);
      } else {
        setBoostStatus("error");
      }
    } catch (error) {
      setBoostStatus("error", error);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>
          <FiX size={24} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.boostBadge}>
            <FiZap className={styles.badgeIcon} />
            <span>Boost Song</span>
          </div>
          <h2>Amplify the Beat</h2>
          <p className={styles.subtitle}>
            Boost <span className={styles.songTitle}>{songTitle}</span> to
            increase its visibility and help it trend
          </p>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <FiTrendingUp className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{currentBoostCount || 0}</span>
              <span className={styles.statLabel}>Current Boosts</span>
            </div>
          </div>
        </div>

        <div className={styles.balanceDisplay}>
          <FiZap className={styles.balanceIcon} />
          <div>
            <div className={styles.balanceLabel}>Your Balance</div>
            <div className={styles.balanceAmount}>
              {tokenBalance.toLocaleString()} VIBE
            </div>
          </div>
          <button
            className={styles.buyTokensBtn}
            onClick={() => setShowBuyTokens(true)}
          >
            <FiShoppingBag /> Buy Tokens
          </button>
        </div>

        <div className={styles.inputSection}>
          <label className={styles.inputLabel}>
            Boost Amount (VIBE Tokens)
          </label>
          <div className={styles.inputWrapper}>
            <FiZap className={styles.inputIcon} />
            <input
              type="number"
              placeholder="0"
              value={boostAmount}
              onChange={(e) => setBoostAmount(e.target.value)}
              className={styles.input}
              step="1"
              min="0"
            />
          </div>
          <div className={styles.presetButtons}>
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                className={styles.presetBtn}
                onClick={() => setBoostAmount(amount.toString())}
              >
                {amount} VIBE
              </button>
            ))}
          </div>
        </div>

        <div className={styles.benefitsSection}>
          <h3 className={styles.benefitsTitle}>How Boosting Works</h3>
          <div className={styles.benefitItem}>
            <FiTarget className={styles.benefitIcon} />
            <div className={styles.benefitText}>
              <strong>Increased Visibility</strong>
              <p>Higher boost = better ranking in discovery & trending</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <FiAward className={styles.benefitIcon} />
            <div className={styles.benefitText}>
              <strong>Support Artists</strong>
              <p>50% goes directly to the artist, 50% is burned</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <FiTrendingUp className={styles.benefitIcon} />
            <div className={styles.benefitText}>
              <strong>Deflationary</strong>
              <p>Burning tokens increases overall value</p>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <Button
            text={
              boostStatus === "processing"
                ? "Boosting..."
                : boostStatus === "success"
                ? "✓ Boost Successful!"
                : "Boost This Song"
            }
            icon={boostStatus === "success" ? <FiCheck /> : <FiZap />}
            disabled={
              boostStatus === "processing" ||
              boostStatus === "success" ||
              !boostAmount ||
              parseInt(boostAmount) <= 0 ||
              parseInt(boostAmount) > tokenBalance
            }
            onClick={handleBoost}
            className={styles.primaryButton}
          />

          {boostStatus === "insufficient" && (
            <div className={styles.errorAlert}>
              <FiAlertTriangle />
              <span>
                Insufficient VIBE tokens. Buy more tokens to continue.
              </span>
            </div>
          )}

          {boostStatus === "error" && (
            <div className={styles.errorAlert}>
              <FiAlertTriangle />
              <span>Boost failed. Please try again.</span>
            </div>
          )}

          {boostStatus === "success" && (
            <div className={styles.successAlert}>
              <FiCheck />
              <span>
                Song boosted successfully! It will now rank higher in discovery.
              </span>
            </div>
          )}
        </div>
      </div>
      <BuyTokensModal
        isOpen={showBuyTokens}
        onClose={() => setShowBuyTokens(false)}
      />
    </div>
  );
};

export default BoostSongModal;
