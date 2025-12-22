import { FiPlay, FiHeart, FiMoreVertical, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import styles from "./TrackListItem.module.css";

const TrackListItem = ({ 
  track, 
  index, 
  onPlay, 
  onAddToPlaylist,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={styles.trackItem}>
      <div className={styles.trackNumber}>{index + 1}</div>
      
      <div className={styles.trackImageContainer}>
        <img 
          src={track.music_art} 
          alt={track.title} 
          className={styles.trackImage}
        />
        <button 
          className={styles.playOverlay}
          onClick={onPlay}
        >
          <FiPlay />
        </button>
      </div>

      <div className={styles.trackInfo}>
        <div className={styles.trackTitle}>{track.title}</div>
        <div className={styles.trackArtist}>{track.artist_name}</div>
      </div>

      <div className={styles.trackGenre}>{track.music_genre || "Unknown"}</div>

      <div className={styles.trackVotes}>
        <FiHeart className={styles.voteIcon} />
        <span>{track.vote_count || 0}</span>
      </div>

      <div className={styles.trackActions}>
        {onAddToPlaylist && (
          <button
            className={styles.actionButton}
            onClick={onAddToPlaylist}
            title="Add to playlist"
          >
            <FiPlus />
          </button>
        )}
        
        {showActions && (
          <div className={styles.moreActions}>
            <button
              className={styles.actionButton}
              onClick={() => setShowMenu(!showMenu)}
            >
              <FiMoreVertical />
            </button>
            
            {showMenu && (
              <div className={styles.actionMenu}>
                {onEdit && (
                  <button 
                    className={styles.menuItem}
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                  >
                    <FiEdit /> Edit
                  </button>
                )}
                {onDelete && (
                  <button 
                    className={styles.menuItem}
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                  >
                    <FiTrash2 /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackListItem;
