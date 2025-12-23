import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiPlay, FiHeart, FiPlus } from "react-icons/fi";
import styles from "./MusicCard.module.css";

const MusicCard = ({ track, quality, onPlay, onAddToPlaylist }) => {
  const [formattedDuration, setFormattedDuration] = useState("0:00");
  const [isHovered, setIsHovered] = useState(false);
  const isPremium = quality === "Premium";

  useEffect(() => {
    const audio = new Audio(
      isPremium ? track.high_quality_ipfs : track.low_quality_ipfs
    );

    const handleLoadedMetadata = () => {
      const totalSeconds = audio.duration;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      setFormattedDuration(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [isPremium, track.high_quality_ipfs, track.low_quality_ipfs]);

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlay) {
      onPlay(track);
    }
  };

  const handleAddToPlaylist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToPlaylist) {
      onAddToPlaylist(track);
    }
  };

  return (
    <Link
      to={`/discover/${track.id.id}`}
      className={styles.musicCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <img
          src={track.music_art}
          alt={track.title}
          className={styles.musicImg}
        />
        <div
          className={`${styles.playOverlay} ${isHovered ? styles.visible : ""}`}
        >
          <button className={styles.playButton} onClick={handlePlayClick}>
            <FiPlay />
          </button>
        </div>
        <div
          className={`${styles.qualityBadge} ${
            isPremium ? styles.premiumBadge : ""
          }`}
        >
          {quality}
        </div>
      </div>

      <div className={styles.musicDetails}>
        <h3 className={styles.musicTitle}>{track.title}</h3>
        <p className={styles.musicArtist}>
          {`${track.artist.slice(0, 6)}...${track.artist.slice(-4)}`}
        </p>
        <div className={styles.musicMeta}>
          <span>{formattedDuration}</span>
          <span>•</span>
          <span>{track.like_count || 0} likes</span>
          <span>•</span>
          <span>{track.streaming_count || 0} plays</span>
          {onAddToPlaylist && (
            <>
              <span>•</span>
              <button
                className={styles.addToPlaylistBtn}
                onClick={handleAddToPlaylist}
                title="Add to playlist"
              >
                <FiPlus />
              </button>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MusicCard;
