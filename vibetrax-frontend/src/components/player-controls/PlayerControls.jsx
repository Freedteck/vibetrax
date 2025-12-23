import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./PlayerControls.module.css";
import { useMovementWallet } from "../../hooks/useMovementWallet";

const PlayerControls = ({ songData, onDurationLoaded, onPlayStatusChange }) => {
  const { walletAddress } = useMovementWallet();
  const subscriberData = useOutletContext();
  const audioRef = useRef(null);

  // Normalize addresses for comparison
  const normalizeAddress = (addr) => {
    if (!addr) return "";
    let normalized = addr.toLowerCase();
    if (!normalized.startsWith("0x")) normalized = "0x" + normalized;
    if (normalized.length < 66) {
      normalized = "0x" + normalized.slice(2).padStart(64, "0");
    }
    return normalized;
  };

  const isPremium =
    normalizeAddress(walletAddress) === normalizeAddress(songData?.artist) ||
    normalizeAddress(walletAddress) ===
      normalizeAddress(songData?.current_owner) ||
    songData?.collaborators
      ?.map((c) => normalizeAddress(c))
      ?.includes(normalizeAddress(walletAddress)) ||
    (subscriberData?.subscriberData && subscriberData.subscriberData.is_active);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => onPlayStatusChange(true);
    const handlePause = () => onPlayStatusChange(false);
    const handleLoadedMetadata = () => {
      onDurationLoaded(audio.duration);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [onDurationLoaded, onPlayStatusChange]);

  return (
    <div className={styles.container}>
      <audio
        ref={audioRef}
        className={styles.audio}
        controls
        src={isPremium ? songData.high_quality_ipfs : songData.low_quality_ipfs}
      />
    </div>
  );
};

export default PlayerControls;
