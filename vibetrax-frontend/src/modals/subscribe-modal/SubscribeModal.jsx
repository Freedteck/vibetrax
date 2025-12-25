import { useMusicActions } from "../../hooks/useMusicActions";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import React, { useState, useEffect } from "react";
import styles from "./SubscribeModal.module.css";
import Button from "../../components/button/Button";
import {
  FiX,
  FiMusic,
  FiLock,
  FiHeadphones,
  FiStar,
  FiCheck,
  FiAlertTriangle,
  FiZap,
  FiDownload,
  FiTrendingUp,
  FiDollarSign,
} from "react-icons/fi";

const SubscribeModal = ({ isOpen, onClose }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState("idle");
  const [paymentMethod, setPaymentMethod] = useState("move"); // 'move' or 'token'
  const { subscribe, subscribeWithTokens } = useMusicActions();
  const { tokenBalance } = useTokenBalance();

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

  const handleSubscribe = async () => {
    setSubscriptionStatus("subscribing");
    try {
      if (paymentMethod === "move") {
        await subscribe(setSubscriptionStatus);
      } else {
        await subscribeWithTokens(setSubscriptionStatus);
      }
      setTimeout(() => {
        setSubscriptionStatus("subscribed");
      }, 1000);
    } catch {
      setSubscriptionStatus("failed");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>
          <FiX size={24} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.premiumBadge}>
            <FiStar className={styles.badgeIcon} />
            <span>Premium</span>
          </div>
          <h2>Unlock Premium Features</h2>
          <p className={styles.subtitle}>
            Experience music like never before with exclusive benefits
          </p>
        </div>

        {/* Payment Method Selector */}
        <div className={styles.paymentSelector}>
          <button
            className={`${styles.paymentOption} ${
              paymentMethod === "move" ? styles.active : ""
            }`}
            onClick={() => setPaymentMethod("move")}
          >
            <FiDollarSign className={styles.paymentIcon} />
            <div className={styles.paymentInfo}>
              <span className={styles.paymentName}>Pay with MOVE</span>
              <span className={styles.paymentPrice}>0.01 MOVE</span>
            </div>
          </button>
          <button
            className={`${styles.paymentOption} ${
              paymentMethod === "token" ? styles.active : ""
            }`}
            onClick={() => setPaymentMethod("token")}
            disabled={tokenBalance < 100}
          >
            <FiZap className={styles.paymentIcon} />
            <div className={styles.paymentInfo}>
              <span className={styles.paymentName}>Pay with VIBE</span>
              <span className={styles.paymentPrice}>
                100 VIBE {tokenBalance < 100 && "(Insufficient)"}
              </span>
            </div>
          </button>
        </div>

        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiHeadphones size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>High-Quality Audio</h3>
              <p>320kbps crystal clear sound quality</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiZap size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>Ad-Free Experience</h3>
              <p>Uninterrupted music streaming</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiDownload size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>Offline Downloads</h3>
              <p>Listen anywhere, anytime</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiMusic size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>Early Access</h3>
              <p>New releases before everyone</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiLock size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>Exclusive Content</h3>
              <p>Premium tracks and albums</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiTrendingUp size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>Support Artists</h3>
              <p>Directly fund music creators</p>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <Button
            text={
              subscriptionStatus === "subscribing"
                ? "Processing..."
                : subscriptionStatus === "subscribed"
                ? "✓ Subscribed Successfully"
                : "Get Premium Now"
            }
            icon={
              subscriptionStatus === "subscribed" ? <FiCheck /> : <FiStar />
            }
            disabled={
              subscriptionStatus === "subscribing" ||
              subscriptionStatus === "subscribed"
            }
            onClick={handleSubscribe}
            className={styles.primaryButton}
          />

          {subscriptionStatus === "failed" && (
            <div className={styles.errorAlert}>
              <FiAlertTriangle />
              <span>Payment failed. Please try again.</span>
            </div>
          )}

          {subscriptionStatus === "subscribed" && (
            <div className={styles.successAlert}>
              <FiCheck />
              <span>Welcome to Premium! Enjoy your enhanced experience.</span>
            </div>
          )}

          <p className={styles.secureNote}>
            <FiLock size={14} /> Secure blockchain transaction via MOVE
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
