import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
  FiHeart,
  FiMaximize2,
  FiX,
} from "react-icons/fi";
import { MdShuffle, MdRepeat, MdRepeatOne } from "react-icons/md";
import styles from "./NowPlayingBar.module.css";

const NowPlayingBar = ({ currentTrack, playlist = [], onTrackChange, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // off, all, one
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      setIsLoading(true);
      audioRef.current.src =
        currentTrack.high_quality_ipfs || currentTrack.low_quality_ipfs;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Playback error:", err);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (audioRef.current && !isLoading) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Playback error:", err);
        });
        setIsPlaying(true);
      }
    }
  }, [isPlaying, isLoading]);

  const seekForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  }, [currentTime, duration]);

  const seekBackward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  }, [currentTime]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleLike = useCallback(() => {
    setIsLiked(!isLiked);
  }, [isLiked]);

  const handleNext = useCallback(() => {
    if (playlist.length > 0 && onTrackChange) {
      const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % playlist.length;
      onTrackChange(playlist[nextIndex]);
    }
  }, [playlist, onTrackChange, currentTrack]);

  const handlePrevious = useCallback(() => {
    if (playlist.length > 0 && onTrackChange) {
      const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      onTrackChange(playlist[prevIndex]);
    }
  }, [playlist, onTrackChange, currentTrack]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowright":
          if (e.shiftKey) {
            handleNext();
          } else {
            seekForward();
          }
          break;
        case "arrowleft":
          if (e.shiftKey) {
            handlePrevious();
          } else {
            seekBackward();
          }
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          setIsMuted(false);
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          break;
        case "m":
          toggleMute();
          break;
        case "l":
          toggleLike();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlay,
    seekForward,
    seekBackward,
    handleNext,
    handlePrevious,
    toggleMute,
    toggleLike,
  ]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleRepeat = () => {
    const modes = ["off", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (!currentTrack) return null;

  return (
    <div className={styles.playerBar}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
      />

      {/* Track Info */}
      <div className={styles.trackInfo}>
        <img
          src={currentTrack.music_art}
          alt={currentTrack.title}
          className={styles.albumArt}
          onClick={() => navigate(`/discover/${currentTrack.id.id}`)}
        />
        <div className={styles.trackDetails}>
          <h4 className={styles.trackTitle}>{currentTrack.title}</h4>
          <p className={styles.trackArtist}>
            {currentTrack.artist.slice(0, 6)}...{currentTrack.artist.slice(-4)}
          </p>
        </div>
        <button
          className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
          onClick={() => setIsLiked(!isLiked)}
        >
          <FiHeart />
        </button>
      </div>

      {/* Player Controls */}
      <div className={styles.playerControls}>
        <div className={styles.controlButtons}>
          <button
            className={`${styles.controlBtn} ${styles.smallBtn} ${
              isShuffled ? styles.active : ""
            }`}
            onClick={() => setIsShuffled(!isShuffled)}
          >
            <MdShuffle />
          </button>
          <button className={styles.controlBtn} onClick={handlePrevious}>
            <FiSkipBack />
          </button>
          <button
            className={styles.playButton}
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.spinner} />
            ) : isPlaying ? (
              <FiPause />
            ) : (
              <FiPlay />
            )}
          </button>
          <button className={styles.controlBtn} onClick={handleNext}>
            <FiSkipForward />
          </button>
          <button
            className={`${styles.controlBtn} ${styles.smallBtn} ${
              repeatMode !== "off" ? styles.active : ""
            }`}
            onClick={toggleRepeat}
          >
            {repeatMode === "one" ? <MdRepeatOne /> : <MdRepeat />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeek}
            className={styles.progressBar}
          />
          <span className={styles.timeLabel}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Controls */}
      <div className={styles.volumeControls}>
        <button className={styles.controlBtn} onClick={toggleMute}>
          {isMuted || volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume * 100}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
        />
        <button 
          className={styles.controlBtn}
          onClick={() => navigate(`/discover/${currentTrack.id.id}`)}
        >
          <FiMaximize2 />
        </button>
        <button 
          className={`${styles.controlBtn} ${styles.closeBtn}`}
          onClick={onClose}
          title="Close player"
        >
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default NowPlayingBar;
