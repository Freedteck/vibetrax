import styles from "./StateStyles.module.css";

export const LoadingState = ({
  message = "Loading...",
  variant = "default", // default, cards, player, minimal
}) => {
  if (variant === "cards") {
    return (
      <div className={styles.loadingCardsWrapper}>
        <div className={styles.loadingCardsContainer}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonText}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonSubtitle}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "player") {
    return (
      <div className={styles.loadingPlayerContainer}>
        <div className={styles.skeletonPlayerArt}></div>
        <div className={styles.skeletonPlayerInfo}>
          <div className={styles.skeletonPlayerTitle}></div>
          <div className={styles.skeletonPlayerArtist}></div>
        </div>
        <div className={styles.skeletonPlayerControls}>
          <div className={styles.skeletonButton}></div>
          <div className={styles.skeletonButton}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={styles.loadingMinimal}>
        <div className={styles.spinnerDots}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className={styles.minimalMessage}>{message}</p>
      </div>
    );
  }

  // Default variant - music wave animation
  return (
    <div className={styles.loadingDefault}>
      <div className={styles.musicWave}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>
      <p className={styles.loadingMessage}>{message}</p>
    </div>
  );
};
