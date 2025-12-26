import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./PlayerControls.module.css";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { useStreamTracking } from "../../hooks/useStreamTracking";

const PlayerControls = ({ songData, onDurationLoaded, onPlayStatusChange }) => {
  const { walletAddress } = useMovementWallet();
  const subscriberData = useOutletContext();
  const audioRef = useRef(null);
  const { trackStream } = useStreamTracking();
  const [playStartTime, setPlayStartTime] = useState(null);
  const [hasTrackedStream, setHasTrackedStream] = useState(false);

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

    const handlePlay = () => {
      onPlayStatusChange(true);
      setPlayStartTime(Date.now());
    };

    const handlePause = () => {
      onPlayStatusChange(false);
      // Track stream if played for 30+ seconds
      if (playStartTime && !hasTrackedStream) {
        const duration = Math.floor((Date.now() - playStartTime) / 1000);
        if (duration >= 30 && songData?.id?.id) {
          trackStream(songData.id.id, duration);
          setHasTrackedStream(true);
        }
      }
      setPlayStartTime(null);
    };

    const handleEnded = () => {
      onPlayStatusChange(false);
      // Track full stream on song end
      if (playStartTime && !hasTrackedStream && songData?.id?.id) {
        const duration = Math.floor((Date.now() - playStartTime) / 1000);
        if (duration >= 30) {
          trackStream(songData.id.id, duration);
          setHasTrackedStream(true);
        }
      }
      setPlayStartTime(null);
    };

    const handleLoadedMetadata = () => {
      onDurationLoaded(audio.duration);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [
    onDurationLoaded,
    onPlayStatusChange,
    playStartTime,
    hasTrackedStream,
    songData,
    trackStream,
  ]);

  // Reset tracking when song changes
  useEffect(() => {
    setHasTrackedStream(false);
    setPlayStartTime(null);
  }, [songData?.id?.id]);

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
