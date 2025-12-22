import { useEffect, useState } from "react";
import {
  FiX,
  FiHeadphones,
  FiDollarSign,
  FiDownload,
  FiAward,
  FiLock,
  FiCheck,
  FiMusic,
  FiShield,
} from "react-icons/fi";
import Button from "../../components/button/Button";
import styles from "./PremiumModal.module.css";

const PremiumModal = ({ isOpen, onClose, songData, onPurchase }) => {
  const [paymentStatus, setPaymentStatus] = useState("idle");

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
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

  const handleBuy = async (e) => {
    e.preventDefault();
    setPaymentStatus("pending");
    const success = await onPurchase();
    setPaymentStatus(success ? "success" : "failed");
    
    if (success) {
      setTimeout(() => {
        onClose();
        setPaymentStatus("idle");
      }, 2000);
    }
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.purchaseModal}>
        <button className={styles.modalClose} onClick={onClose}>
          <FiX />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.premiumBadge}>
            <FiAward />
            <span>Premium Quality</span>
          </div>
          <h2 className={styles.modalTitle}>Unlock High-Quality Audio</h2>
          <p className={styles.modalSubtitle}>
            Get the best listening experience with lossless audio
          </p>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.trackPreview}>
            <img
              src={songData?.fields.music_art}
              alt="Album Art"
              className={styles.previewImg}
            />
            <div className={styles.previewDetails}>
              <h3 className={styles.previewTitle}>{songData?.fields.title}</h3>
              <p className={styles.previewArtist}>
                {`${songData?.fields.artist.slice(0, 6)}...${songData?.fields.artist.slice(-6)}`}
              </p>
              <div className={styles.trackMeta}>
                <div className={styles.metaItem}>
                  <FiMusic />
                  <span>Single Track</span>
                </div>
                <div className={styles.metaItem}>
                  <FiHeadphones />
                  <span>320 kbps</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.comparisonSection}>
            <h3 className={styles.sectionTitle}>What You Get</h3>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FiHeadphones />
                </div>
                <div className={styles.featureText}>
                  <h4>Premium Audio</h4>
                  <p>320 kbps lossless quality</p>
                </div>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FiDownload />
                </div>
                <div className={styles.featureText}>
                  <h4>Download Rights</h4>
                  <p>Offline listening enabled</p>
                </div>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FiDollarSign />
                </div>
                <div className={styles.featureText}>
                  <h4>Support Artist</h4>
                  <p>85% goes to creator</p>
                </div>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FiAward />
                </div>
                <div className={styles.featureText}>
                  <h4>Forever Yours</h4>
                  <p>Lifetime ownership</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.priceDisplay}>
            <div className={styles.priceInfo}>
              <span className={styles.priceLabel}>One-time purchase</span>
              <div className={styles.priceAmount}>
                <span className={styles.price}>{songData?.fields.price}</span>
                <span className={styles.currency}>IOTA</span>
              </div>
            </div>
          </div>

          {paymentStatus === "success" ? (
            <div className={styles.successMessage}>
              <FiCheck />
              <span>Purchase Successful!</span>
            </div>
          ) : paymentStatus === "failed" ? (
            <div className={styles.errorMessage}>
              <FiX />
              <span>Payment Failed. Please try again.</span>
            </div>
          ) : null}

          <Button
            text={
              paymentStatus === "pending"
                ? "Processing Payment..."
                : paymentStatus === "success"
                ? "✓ Purchase Complete"
                : "Complete Purchase"
            }
            onClick={handleBuy}
            disabled={paymentStatus === "pending" || paymentStatus === "success"}
            className={styles.purchaseButton}
          />
          
          <p className={styles.secureNote}>
            <FiShield />
            Secure blockchain transaction via IOTA Network
          </p>
        </div>
      </div>
    </>
  );
};

export default PremiumModal;
