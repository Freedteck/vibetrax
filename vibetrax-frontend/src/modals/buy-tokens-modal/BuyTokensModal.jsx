import React, { useState, useEffect } from "react";
import styles from "./BuyTokensModal.module.css";
import Button from "../../components/button/Button";
import { useMusicActions } from "../../hooks/useMusicActions";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import {
  FiX,
  FiZap,
  FiCheck,
  FiAlertTriangle,
  FiShoppingBag,
  FiArrowRight,
  FiTrendingUp,
  FiHeart,
  FiTarget,
} from "react-icons/fi";

const BuyTokensModal = ({ isOpen, onClose }) => {
  const [moveAmount, setMoveAmount] = useState("");
  const [buyStatus, setBuyStatus] = useState("idle");
  const { buyTokens } = useMusicActions();
  const { tokenBalance } = useTokenBalance();

  const presetAmounts = [1, 5, 10, 50, 100];
  const EXCHANGE_RATE = 1000;

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

  const calculateTokens = (move) => {
    const amount = parseFloat(move) || 0;
    return Math.floor(amount * EXCHANGE_RATE);
  };

  const handleBuyTokens = async () => {
    const amount = parseFloat(moveAmount);
    if (!amount || amount <= 0) {
      setBuyStatus("error");
      return;
    }

    setBuyStatus("processing");
    try {
      const success = await buyTokens(amount);
      if (success) {
        setBuyStatus("success");
        setTimeout(() => {
          onClose();
          setMoveAmount("");
          setBuyStatus("idle");
        }, 2000);
      } else {
        setBuyStatus("error");
      }
    } catch (error) {
      setBuyStatus("error", error);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>
          <FiX size={24} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.buyBadge}>
            <FiShoppingBag className={styles.badgeIcon} />
            <span>Buy VIBE Tokens</span>
          </div>
          <h2>Power Up Your Experience</h2>
          <p className={styles.subtitle}>
            Purchase VIBE tokens to tip artists, boost songs, and unlock premium
            features
          </p>
        </div>

        <div className={styles.balanceDisplay}>
          <FiZap className={styles.balanceIcon} />
          <div>
            <div className={styles.balanceLabel}>Current Balance</div>
            <div className={styles.balanceAmount}>
              {tokenBalance.toLocaleString()} VIBE
            </div>
          </div>
        </div>

        <div className={styles.exchangeRate}>
          <div className={styles.rateCard}>
            <span className={styles.rateMoveAmount}>1 MOVE</span>
            <FiArrowRight className={styles.rateArrow} />
            <span className={styles.rateTokenAmount}>1,000 VIBE</span>
          </div>
        </div>

        <div className={styles.inputSection}>
          <label className={styles.inputLabel}>Amount (MOVE)</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>MOVE</span>
            <input
              type="number"
              placeholder="0.0"
              value={moveAmount}
              onChange={(e) => setMoveAmount(e.target.value)}
              className={styles.input}
              step="0.1"
              min="0"
            />
          </div>
          <div className={styles.presetButtons}>
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                className={styles.presetBtn}
                onClick={() => setMoveAmount(amount.toString())}
              >
                {amount} MOVE
              </button>
            ))}
          </div>
        </div>

        {moveAmount && parseFloat(moveAmount) > 0 && (
          <div className={styles.previewSection}>
            <div className={styles.previewLabel}>You'll Receive</div>
            <div className={styles.previewAmount}>
              <FiZap className={styles.previewIcon} />
              {calculateTokens(moveAmount).toLocaleString()} VIBE Tokens
            </div>
          </div>
        )}

        <div className={styles.benefitsSection}>
          <h3 className={styles.benefitsTitle}>What You Can Do</h3>
          <div className={styles.benefitItem}>
            <FiHeart className={styles.benefitIcon} />
            <div className={styles.benefitText}>
              <strong>Tip Artists</strong>
              <p>Support creators directly with token tips</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <FiTarget className={styles.benefitIcon} />
            <div className={styles.benefitText}>
              <strong>Boost Songs</strong>
              <p>Increase visibility and help tracks trend</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <FiTrendingUp className={styles.benefitIcon} />
            <div className={styles.benefitText}>
              <strong>Premium Features</strong>
              <p>Subscribe and unlock exclusive content</p>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <Button
            text={
              buyStatus === "processing"
                ? "Processing..."
                : buyStatus === "success"
                ? "✓ Purchase Complete!"
                : "Buy Tokens"
            }
            icon={buyStatus === "success" ? <FiCheck /> : <FiShoppingBag />}
            disabled={
              buyStatus === "processing" ||
              buyStatus === "success" ||
              !moveAmount ||
              parseFloat(moveAmount) <= 0
            }
            onClick={handleBuyTokens}
            className={styles.primaryButton}
          />

          {buyStatus === "error" && (
            <div className={styles.errorAlert}>
              <FiAlertTriangle />
              <span>
                Purchase failed. Please check your balance and try again.
              </span>
            </div>
          )}

          {buyStatus === "success" && (
            <div className={styles.successAlert}>
              <FiCheck />
              <span>
                Tokens purchased successfully! Your balance has been updated.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyTokensModal;
