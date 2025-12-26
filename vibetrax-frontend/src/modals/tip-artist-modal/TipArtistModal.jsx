import React, { useState, useEffect } from "react";
import styles from "./TipArtistModal.module.css";
import Button from "../../components/button/Button";
import { useMusicActions } from "../../hooks/useMusicActions";
import { useAppContext } from "../../hooks/useAppContext";
import BuyTokensModal from "../buy-tokens-modal/BuyTokensModal";
import {
  FiX,
  FiDollarSign,
  FiHeart,
  FiCheck,
  FiAlertTriangle,
  FiZap,
  FiTrendingUp,
  FiShoppingBag,
} from "react-icons/fi";

const TipArtistModal = ({
  isOpen,
  onClose,
  nftId,
  artistAddress,
  artistName,
}) => {
  const [tipAmount, setTipAmount] = useState("");
  const [tipStatus, setTipStatus] = useState("idle");
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const { tipArtist } = useMusicActions();
  const { tokenBalance } = useAppContext();

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

  const handleTip = async () => {
    const amount = parseInt(tipAmount);
    if (!amount || amount <= 0) {
      setTipStatus("error");
      return;
    }

    if (amount > tokenBalance) {
      setTipStatus("insufficient");
      return;
    }

    setTipStatus("processing");
    try {
      const success = await tipArtist(nftId, amount);
      if (success) {
        setTipStatus("success");
        setTimeout(() => {
          onClose();
          setTipAmount("");
          setTipStatus("idle");
        }, 2000);
      } else {
        setTipStatus("error");
      }
    } catch (error) {
      setTipStatus("error", error);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>
          <FiX size={24} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.tipBadge}>
            <FiHeart className={styles.badgeIcon} />
            <span>Tip Artist</span>
          </div>
          <h2>Support the Creator</h2>
          <p className={styles.subtitle}>
            Send VIBE tokens directly to{" "}
            <span className={styles.artistName}>
              {artistName ||
                `${artistAddress?.slice(0, 6)}...${artistAddress?.slice(-4)}`}
            </span>
          </p>
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
          <label className={styles.inputLabel}>Tip Amount (VIBE Tokens)</label>
          <div className={styles.inputWrapper}>
            <FiZap className={styles.inputIcon} />
            <input
              type="number"
              placeholder="0"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
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
                onClick={() => setTipAmount(amount.toString())}
              >
                {amount} VIBE
              </button>
            ))}
          </div>
        </div>

        <div className={styles.benefitsSection}>
          <div className={styles.benefitItem}>
            <FiZap className={styles.benefitIcon} />
            <span>Instant transfer via blockchain</span>
          </div>
          <div className={styles.benefitItem}>
            <FiHeart className={styles.benefitIcon} />
            <span>100% goes to the artist</span>
          </div>
          <div className={styles.benefitItem}>
            <FiTrendingUp className={styles.benefitIcon} />
            <span>Supports independent creators</span>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <Button
            text={
              tipStatus === "processing"
                ? "Processing..."
                : tipStatus === "success"
                ? "✓ Tip Sent!"
                : "Send Tip"
            }
            icon={tipStatus === "success" ? <FiCheck /> : <FiHeart />}
            disabled={
              tipStatus === "processing" ||
              tipStatus === "success" ||
              !tipAmount ||
              parseInt(tipAmount) <= 0 ||
              parseInt(tipAmount) > tokenBalance
            }
            onClick={handleTip}
            className={styles.primaryButton}
          />

          {tipStatus === "insufficient" && (
            <div className={styles.errorAlert}>
              <FiAlertTriangle />
              <span>
                Insufficient VIBE tokens. Buy more tokens to continue.
              </span>
            </div>
          )}

          {tipStatus === "error" && (
            <div className={styles.errorAlert}>
              <FiAlertTriangle />
              <span>Tip failed. Please try again.</span>
            </div>
          )}

          {tipStatus === "success" && (
            <div className={styles.successAlert}>
              <FiCheck />
              <span>
                Your tip has been sent successfully! Thank you for supporting
                the artist.
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

export default TipArtistModal;
