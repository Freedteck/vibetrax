import { useState, useEffect } from "react";
import { FiX, FiMusic, FiCheckCircle, FiPlus } from "react-icons/fi";
import styles from "./AddToPlaylistModal.module.css";
import toast from "react-hot-toast";

const AddToPlaylistModal = ({ isOpen, onClose, track, playlists, onAddToPlaylist, onCreateNew }) => {
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedPlaylists([]);
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

  if (!isOpen || !track) return null;

  const isTrackInPlaylist = (playlist) => {
    return playlist.tracks?.some((t) => t.id === track.id?.id || t.id === track.id);
  };

  const handlePlaylistClick = (playlist) => {
    if (isTrackInPlaylist(playlist)) {
      toast.error("Track already in this playlist");
      return;
    }

    if (selectedPlaylists.includes(playlist.id)) {
      setSelectedPlaylists(selectedPlaylists.filter((id) => id !== playlist.id));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlist.id]);
    }
  };

  const handleAddToSelected = () => {
    if (selectedPlaylists.length === 0) {
      toast.error("Please select at least one playlist");
      return;
    }

    selectedPlaylists.forEach((playlistId) => {
      onAddToPlaylist(playlistId, track);
    });

    toast.success(`Added to ${selectedPlaylists.length} playlist(s)`);
    onClose();
  };

  const handleCreateNewClick = () => {
    onClose();
    onCreateNew();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FiX />
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add to Playlist</h2>
          <div className={styles.trackInfo}>
            <img src={track.music_art} alt={track.title} className={styles.trackThumb} />
            <div className={styles.trackDetails}>
              <p className={styles.trackTitle}>{track.title}</p>
              <p className={styles.trackArtist}>{track.artist_name || "Unknown Artist"}</p>
            </div>
          </div>
        </div>

        <div className={styles.modalBody}>
          <button className={styles.createNewButton} onClick={handleCreateNewClick}>
            <FiPlus />
            <span>Create New Playlist</span>
          </button>

          {playlists.length === 0 ? (
            <div className={styles.emptyState}>
              <FiMusic className={styles.emptyIcon} />
              <p>No playlists yet. Create one to get started!</p>
            </div>
          ) : (
            <div className={styles.playlistsList}>
              {playlists.map((playlist) => {
                const inPlaylist = isTrackInPlaylist(playlist);
                const isSelected = selectedPlaylists.includes(playlist.id);

                return (
                  <button
                    key={playlist.id}
                    className={`${styles.playlistItem} ${
                      isSelected ? styles.selected : ""
                    } ${inPlaylist ? styles.disabled : ""}`}
                    onClick={() => handlePlaylistClick(playlist)}
                    disabled={inPlaylist}
                  >
                    <div className={styles.playlistIcon}>
                      <FiMusic />
                    </div>
                    <div className={styles.playlistInfo}>
                      <p className={styles.playlistName}>{playlist.name}</p>
                      <p className={styles.playlistMeta}>
                        {playlist.tracks?.length || 0} songs
                      </p>
                    </div>
                    {inPlaylist ? (
                      <span className={styles.alreadyAdded}>Already added</span>
                    ) : isSelected ? (
                      <FiCheckCircle className={styles.checkIcon} />
                    ) : (
                      <div className={styles.checkbox} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedPlaylists.length > 0 && (
          <div className={styles.modalFooter}>
            <button className={styles.addButton} onClick={handleAddToSelected}>
              Add to {selectedPlaylists.length} playlist{selectedPlaylists.length > 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
