import { useEffect, useRef, useState } from "react";
import styles from "./PlayerControls.module.css";
import { useStreamTracking } from "../../hooks/useStreamTracking";
import { useHighQualityLink } from "../../hooks/useHighQualityLink";

const PlayerControls = ({ songData, onDurationLoaded, onPlayStatusChange }) => {
  const audioRef = useRef(null);
  const { trackStream } = useStreamTracking();
  const [playStartTime, setPlayStartTime] = useState(null);
  const [hasTrackedStream, setHasTrackedStream] = useState(false);

  // Get high-quality link from contract if user has access
  const { highQualityLink } = useHighQualityLink(songData?.id?.id);

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

  // Determine audio source - use contract's high-quality link if available, otherwise fallback
  const audioSrc = highQualityLink || songData.low_quality_ipfs;

  return (
    <div className={styles.container}>
      <audio ref={audioRef} className={styles.audio} controls src={audioSrc} />
    </div>
  );
};

export default PlayerControls;
