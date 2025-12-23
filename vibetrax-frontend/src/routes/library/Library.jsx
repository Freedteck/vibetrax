import { useState, useEffect } from "react";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import MusicCard from "../../components/cards/music-card/MusicCard";
import TrackListItem from "../../components/track-list-item/TrackListItem";
import { LoadingState } from "../../components/state/LoadingState";
import { UnconnectedState } from "../../components/state/UnconnectedState";
import { ErrorState } from "../../components/state/ErrorState";
import { EmptyState } from "../../components/state/EmptyState";
import PlaylistModal from "../../modals/playlist-modal/PlaylistModal";
import AddToPlaylistModal from "../../modals/add-to-playlist-modal/AddToPlaylistModal";
import PlaylistDetailModal from "../../modals/playlist-detail-modal/PlaylistDetailModal";
import {
  FiMusic,
  FiHeart,
  FiClock,
  FiGrid,
  FiList,
  FiPlus,
} from "react-icons/fi";
import styles from "./Library.module.css";
import toast from "react-hot-toast";

const Library = () => {
  const { walletAddress } = useMovementWallet();
  const navigate = useNavigate();
  const { handlePlayTrack } = useOutletContext();
  const { musicNfts, isPending, isError } = useMusicNfts();
  const [activeTab, setActiveTab] = useState("playlists");
  const [viewMode, setViewMode] = useState("grid");
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] =
    useState(null);
  const [showPlaylistDetail, setShowPlaylistDetail] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    if (walletAddress) {
      const storedPlaylists = localStorage.getItem(
        `playlists_${walletAddress}`
      );
      const storedLiked = localStorage.getItem(
        `liked_${walletAddress}`
      );
      const storedRecent = localStorage.getItem(
        `recent_${walletAddress}`
      );

      if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));
      if (storedLiked) setLikedSongs(JSON.parse(storedLiked));
      if (storedRecent) setRecentlyPlayed(JSON.parse(storedRecent));
    }
  }, [walletAddress]);

  // Save playlists to localStorage
  const savePlaylistsToStorage = (newPlaylists) => {
    if (walletAddress) {
      localStorage.setItem(
        `playlists_${walletAddress}`,
        JSON.stringify(newPlaylists)
      );
    }
  };

  const handleCreatePlaylist = async (playlistData) => {
    const newPlaylist = {
      id: Date.now().toString(),
      ...playlistData,
    };
    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    savePlaylistsToStorage(updatedPlaylists);
    toast.success("Playlist created successfully!");
  };

  const handleDeletePlaylist = (playlistId) => {
    const updatedPlaylists = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updatedPlaylists);
    savePlaylistsToStorage(updatedPlaylists);
    toast.success("Playlist deleted");
  };

  const handleAddToPlaylist = (playlistId, track) => {
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        const trackData = {
          id: track.id?.id || track.id,
          title: track.title,
          artist: track.artist,
          artist_name: track.artist_name,
          music_art: track.music_art,
          high_quality_ipfs: track.high_quality_ipfs,
          low_quality_ipfs: track.low_quality_ipfs,
          vote_count: track.vote_count,
        };
        return {
          ...playlist,
          tracks: [...(playlist.tracks || []), trackData],
        };
      }
      return playlist;
    });

    setPlaylists(updatedPlaylists);
    savePlaylistsToStorage(updatedPlaylists);
  };

  const handleOpenAddToPlaylist = (track) => {
    setSelectedTrackForPlaylist(track);
    setShowAddToPlaylistModal(true);
  };

  const handleCloseAddToPlaylist = () => {
    setShowAddToPlaylistModal(false);
    setSelectedTrackForPlaylist(null);
  };

  const handleOpenPlaylistDetail = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowPlaylistDetail(true);
  };

  const handleClosePlaylistDetail = () => {
    setShowPlaylistDetail(false);
    setSelectedPlaylist(null);
  };

  const handleRemoveTrackFromPlaylist = (playlistId, trackId) => {
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          tracks: playlist.tracks.filter((track) => track.id !== trackId),
        };
      }
      return playlist;
    });

    setPlaylists(updatedPlaylists);
    savePlaylistsToStorage(updatedPlaylists);

    // Update the selected playlist if it's currently open
    if (selectedPlaylist?.id === playlistId) {
      const updatedSelectedPlaylist = updatedPlaylists.find(
        (p) => p.id === playlistId
      );
      setSelectedPlaylist(updatedSelectedPlaylist);
    }
  };

  const handlePlayPlaylist = (tracks) => {
    if (tracks && tracks.length > 0) {
      handlePlayTrack(tracks[0], tracks);
    }
  };

  if (!currentAccount) {
    return <UnconnectedState />;
  }

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState />;
  }

  // Filter music based on current user
  const ownedMusic = musicNfts.filter(
    (track) => track.current_owner === currentAccount.address
  );
  const uploadedMusic = musicNfts.filter(
    (track) => track.artist === currentAccount.address
  );

  // Get liked songs from storage
  const likedTracks = musicNfts.filter((track) =>
    likedSongs.includes(track.id.id)
  );

  const tabs = [
    {
      id: "playlists",
      label: "Playlists",
      icon: FiMusic,
      count: playlists.length,
    },
    { id: "tracks", label: "Tracks", icon: FiMusic, count: ownedMusic.length },
    {
      id: "uploads",
      label: "Your Uploads",
      icon: FiMusic,
      count: uploadedMusic.length,
    },
    {
      id: "liked",
      label: "Liked Songs",
      icon: FiHeart,
      count: likedTracks.length,
    },
    {
      id: "recent",
      label: "Recently Played",
      icon: FiClock,
      count: recentlyPlayed.length,
    },
  ];

  const renderContent = () => {
    let tracks = [];
    let title = "";
    let description = "";
    let showManagement = false;

    switch (activeTab) {
      case "tracks":
        tracks = ownedMusic;
        title = "Your Tracks";
        description = "All the music you own";
        break;
      case "uploads":
        tracks = uploadedMusic;
        title = "Your Uploads";
        description = "Tracks you've uploaded to VibeTrax";
        showManagement = true;
        break;
      case "recent":
        tracks = recentlyPlayed;
        title = "Recently Played";
        description = "Your recent listening history";
        break;
      case "liked":
        tracks = likedTracks;
        title = "Liked Songs";
        description = "Songs you've liked";
        break;
      case "playlists":
      default:
        return (
          <div className={styles.playlistsSection}>
            {playlists.length === 0 ? (
              <div className={styles.emptyPlaylists}>
                <FiMusic className={styles.emptyIcon} />
                <h3>Create your first playlist</h3>
                <p>It's easy! We'll help you create playlists.</p>
                <button
                  className={styles.createButton}
                  onClick={() => setShowPlaylistModal(true)}
                >
                  <FiPlus /> Create Playlist
                </button>
              </div>
            ) : (
              <div>
                <div className={styles.contentHeader}>
                  <h2 className={styles.contentTitle}>Your Playlists</h2>
                  <button
                    className={styles.createPlaylistBtn}
                    onClick={() => setShowPlaylistModal(true)}
                  >
                    <FiPlus /> Create Playlist
                  </button>
                </div>
                <div className={styles.playlistGrid}>
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={styles.playlistCard}
                      onClick={() => handleOpenPlaylistDetail(playlist)}
                    >
                      <div className={styles.playlistImage}>
                        {playlist.tracks?.length > 0 &&
                        playlist.tracks[0].music_art ? (
                          <img
                            src={playlist.tracks[0].music_art}
                            alt={playlist.name}
                            className={styles.playlistCover}
                          />
                        ) : (
                          <FiMusic className={styles.playlistPlaceholderIcon} />
                        )}
                      </div>
                      <div className={styles.playlistInfo}>
                        <h4 className={styles.playlistName}>{playlist.name}</h4>
                        <p className={styles.playlistDescription}>
                          {playlist.description || "No description"}
                        </p>
                        <p className={styles.playlistMeta}>
                          {playlist.tracks?.length || 0} songs
                        </p>
                      </div>
                      <button
                        className={styles.deletePlaylist}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(playlist.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }

    if (tracks.length === 0) {
      return (
        <div className={styles.emptyState}>
          <EmptyState
            message={`No ${activeTab} yet`}
            description="Start exploring and build your collection"
          />
          {showManagement && (
            <button
              className={styles.createSongButton}
              onClick={() => navigate("/upload-music")}
            >
              <FiPlus /> Upload New Song
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={styles.libraryContent}>
        <div className={styles.contentHeader}>
          <div>
            <h2 className={styles.contentTitle}>{title}</h2>
            <p className={styles.contentDescription}>{description}</p>
          </div>
          <div className={styles.headerActions}>
            {showManagement && (
              <button
                className={styles.createSongButton}
                onClick={() => navigate("/upload-music")}
              >
                <FiPlus /> Upload Song
              </button>
            )}
            <div className={styles.viewControls}>
              <button
                className={`${styles.viewButton} ${
                  viewMode === "grid" ? styles.active : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <FiGrid />
              </button>
              <button
                className={`${styles.viewButton} ${
                  viewMode === "list" ? styles.active : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        <div
          className={viewMode === "grid" ? styles.trackGrid : styles.trackList}
        >
          {viewMode === "grid"
            ? tracks.map((track) => (
                <MusicCard
                  key={track.id?.id || track.id}
                  track={track}
                  music={track}
                  onPlay={() => handlePlayTrack(track, tracks)}
                  onAddToPlaylist={handleOpenAddToPlaylist}
                />
              ))
            : tracks.map((track, index) => (
                <TrackListItem
                  key={track.id?.id || track.id}
                  track={track}
                  index={index}
                  onPlay={() => handlePlayTrack(track, tracks)}
                  onAddToPlaylist={() => handleOpenAddToPlaylist(track)}
                  showActions={showManagement}
                  onEdit={() => {
                    toast.info("Edit functionality coming soon!");
                  }}
                  onDelete={() => {
                    toast.info("Delete functionality coming soon!");
                  }}
                />
              ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.library}>
      <div className={styles.libraryHeader}>
        <h1 className={styles.pageTitle}>Your Library</h1>
        <p className={styles.pageSubtitle}>
          Manage your music collection and playlists
        </p>
      </div>

      <div className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${
              activeTab === tab.id ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className={styles.tabIcon} />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {renderContent()}

      <PlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        onCreatePlaylist={handleCreatePlaylist}
      />

      <AddToPlaylistModal
        isOpen={showAddToPlaylistModal}
        onClose={handleCloseAddToPlaylist}
        track={selectedTrackForPlaylist}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
        onCreateNew={() => {
          handleCloseAddToPlaylist();
          setShowPlaylistModal(true);
        }}
      />

      <PlaylistDetailModal
        isOpen={showPlaylistDetail}
        onClose={handleClosePlaylistDetail}
        playlist={selectedPlaylist}
        onRemoveTrack={handleRemoveTrackFromPlaylist}
        onPlayPlaylist={handlePlayPlaylist}
      />
    </div>
  );
};

export default Library;
