import { useState, useEffect } from "react";
import { FiX, FiMusic, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import Button from "../../components/button/Button";
import styles from "./PlaylistModal.module.css";

const PlaylistModal = ({ isOpen, onClose, onCreatePlaylist }) => {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setPlaylistName("");
      setPlaylistDescription("");
      setError("");
      setSuccess(false);
    } else {
      document.body.style.overflow = "unset";
    }

    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!playlistName.trim()) {
      setError("Please enter a playlist name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onCreatePlaylist({
        name: playlistName.trim(),
        description: playlistDescription.trim(),
        tracks: [],
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to create playlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FiX />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.iconWrapper}>
            <FiMusic className={styles.headerIcon} />
          </div>
          <h2 className={styles.modalTitle}>Create Playlist</h2>
          <p className={styles.modalSubtitle}>
            Give your playlist a name and description
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="playlistName" className={styles.label}>
              Playlist Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="playlistName"
              className={styles.input}
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="My Awesome Playlist"
              maxLength={50}
              disabled={isLoading || success}
              autoFocus
            />
            <span className={styles.charCount}>{playlistName.length}/50</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="playlistDescription" className={styles.label}>
              Description <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="playlistDescription"
              className={styles.textarea}
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
              placeholder="Add a description for your playlist..."
              maxLength={200}
              rows={4}
              disabled={isLoading || success}
            />
            <span className={styles.charCount}>
              {playlistDescription.length}/200
            </span>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              <FiCheckCircle />
              <span>Playlist created successfully!</span>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading || success}
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isLoading || success || !playlistName.trim()}
              className={styles.createButton}
            >
              {isLoading
                ? "Creating..."
                : success
                ? "Created!"
                : "Create Playlist"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaylistModal;
