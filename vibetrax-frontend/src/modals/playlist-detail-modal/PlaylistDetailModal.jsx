import { useEffect } from "react";
import { FiX, FiPlay, FiTrash2, FiMusic } from "react-icons/fi";
import styles from "./PlaylistDetailModal.module.css";
import toast from "react-hot-toast";

const PlaylistDetailModal = ({
  isOpen,
  onClose,
  playlist,
  onRemoveTrack,
  onPlayPlaylist,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
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

  if (!isOpen || !playlist) return null;

  const handleRemoveTrack = (trackId) => {
    onRemoveTrack(playlist.id, trackId);
    toast.success("Track removed from playlist");
  };

  const handlePlayAll = () => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      onPlayPlaylist(playlist.tracks);
      onClose();
    }
  };

  const handlePlayTrack = (track, index) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      // Play from this track onwards
      const tracksFromHere = playlist.tracks.slice(index);
      onPlayPlaylist(tracksFromHere);
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FiX />
        </button>

        <div className={styles.playlistHeader}>
          <div className={styles.playlistCover}>
            {playlist.tracks?.length > 0 && playlist.tracks[0].music_art ? (
              <img
                src={playlist.tracks[0].music_art}
                alt={playlist.name}
                className={styles.coverImage}
              />
            ) : (
              <div className={styles.placeholderCover}>
                <FiMusic />
              </div>
            )}
          </div>
          <div className={styles.playlistInfo}>
            <span className={styles.playlistType}>Playlist</span>
            <h2 className={styles.playlistName}>{playlist.name}</h2>
            {playlist.description && (
              <p className={styles.playlistDescription}>
                {playlist.description}
              </p>
            )}
            <div className={styles.playlistMeta}>
              <span>{playlist.tracks?.length || 0} songs</span>
            </div>
          </div>
        </div>

        <div className={styles.playlistActions}>
          <button
            className={styles.playAllButton}
            onClick={handlePlayAll}
            disabled={!playlist.tracks || playlist.tracks.length === 0}
          >
            <FiPlay />
            <span>Play All</span>
          </button>
        </div>

        <div className={styles.tracksList}>
          {!playlist.tracks || playlist.tracks.length === 0 ? (
            <div className={styles.emptyPlaylist}>
              <FiMusic className={styles.emptyIcon} />
              <p>No tracks in this playlist yet</p>
              <span>Add some tracks to get started!</span>
            </div>
          ) : (
            playlist.tracks.map((track, index) => (
              <div key={track.id || index} className={styles.trackItem}>
                <div className={styles.trackNumber}>{index + 1}</div>
                <div className={styles.trackImage}>
                  <img src={track.music_art} alt={track.title} />
                  <button
                    className={styles.trackPlayButton}
                    onClick={() => handlePlayTrack(track, index)}
                  >
                    <FiPlay />
                  </button>
                </div>
                <div className={styles.trackInfo}>
                  <p className={styles.trackTitle}>{track.title}</p>
                  <p className={styles.trackArtist}>
                    {track.artist
                      ? `${track.artist.slice(0, 6)}...${track.artist.slice(
                          -4
                        )}`
                      : "Unknown Artist"}
                  </p>
                </div>
                <div className={styles.trackMeta}>
                  <span>{track.like_count || 0} likes</span>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveTrack(track.id)}
                  title="Remove from playlist"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailModal;
