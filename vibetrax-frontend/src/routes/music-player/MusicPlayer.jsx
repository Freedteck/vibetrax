import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiShare2,
  FiShoppingCart,
  FiMoreVertical,
  FiDollarSign,
  FiZap,
} from "react-icons/fi";
import { BsVinyl } from "react-icons/bs";
import styles from "./MusicPlayer.module.css";
import { LoadingState } from "../../components/state/LoadingState";
import { ErrorState } from "../../components/state/ErrorState";
import { useMusicActions } from "../../hooks/useMusicActions";
import PremiumModal from "../../modals/premium-modal/PremiumModal";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import MusicCard from "../../components/cards/music-card/MusicCard";
import SubscribeModal from "../../modals/subscribe-modal/SubscribeModal";
import TipArtistModal from "../../modals/tip-artist-modal/TipArtistModal";
import BoostSongModal from "../../modals/boost-song-modal/BoostSongModal";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { aptos, CONTRACT_ADDRESS } from "../../config/movement";
import toast from "react-hot-toast";

const MusicPlayer = () => {
  const { id } = useParams();
  const { subscriberData, handlePlayTrack } = useOutletContext();
  const { walletAddress } = useMovementWallet();
  const navigate = useNavigate();
  const { voteForTrack, purchaseTrack, toggleTrackForSale, deleteTrack } =
    useMusicActions();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubcribeModalOpen, setIsSubcribeModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [votersData, setVotersData] = useState([]);
  const [songData, setSongData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [isError, setIsError] = useState(false);

  const { musicNfts } = useMusicNfts();

  // Fetch song data and voter data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setIsPending(true);
        setIsError(false);

        // Fetch NFT resource directly
        const nftResource = await aptos.getAccountResource({
          accountAddress: id,
          resourceType: `${CONTRACT_ADDRESS}::vibetrax::MusicNFT`,
        });

        if (nftResource) {
          // Transform data to match expected format
          setSongData({
            id: { id },
            artist: nftResource.artist,
            current_owner: nftResource.current_owner,
            title: nftResource.title,
            description: nftResource.description,
            genre: nftResource.genre,
            music_art: nftResource.music_art,
            high_quality_ipfs: nftResource.high_quality_ipfs,
            low_quality_ipfs: nftResource.low_quality_ipfs,
            base_price: parseInt(nftResource.base_price),
            current_price: parseInt(nftResource.current_price),
            royalty_percentage: parseInt(nftResource.royalty_percentage),
            streaming_count: parseInt(nftResource.streaming_count),
            like_count: parseInt(nftResource.like_count),
            tip_count: parseInt(nftResource.tip_count),
            purchase_count: parseInt(nftResource.purchase_count),
            boost_count: parseInt(nftResource.boost_count),
            collaborators: nftResource.collaborators,
            collaborator_roles: nftResource.collaborator_roles,
            collaborator_splits: nftResource.collaborator_splits.map((s) =>
              parseInt(s)
            ),
            status: nftResource.status.__variant__ || "Available",
            creation_time: parseInt(nftResource.creation_time),
          });
        }

        // Initialize votersData as empty (voting status would need separate tracking)
        if (walletAddress) {
          setVotersData([]);
        }
      } catch (error) {
        console.error("Error fetching song data:", error);
        setIsError(true);
      } finally {
        setIsPending(false);
      }
    };
    fetchData();
  }, [id, walletAddress]);

  // Normalize address for comparison
  const normalizeAddress = (addr) => {
    if (!addr) return "";
    let normalized = addr.toLowerCase();
    if (!normalized.startsWith("0x")) normalized = "0x" + normalized;
    if (normalized.length < 66) {
      normalized = "0x" + normalized.slice(2).padStart(64, "0");
    }
    return normalized;
  };

  const artistMusics = musicNfts
    .filter(
      (music) =>
        normalizeAddress(music.artist) === normalizeAddress(songData?.artist) &&
        music?.id?.id !== id
    )
    .slice(0, 6);

  const forSale = songData?.status === "Available";

  const isOwner =
    normalizeAddress(walletAddress) ===
    normalizeAddress(songData?.current_owner);

  const isPremium =
    normalizeAddress(walletAddress) === normalizeAddress(songData?.artist) ||
    normalizeAddress(walletAddress) ===
      normalizeAddress(songData?.current_owner) ||
    songData?.collaborators
      ?.map((c) => normalizeAddress(c))
      ?.includes(normalizeAddress(walletAddress)) ||
    (subscriberData && subscriberData.is_active);

  const hasVoted = votersData && votersData.length > 0;

  useEffect(() => {
    if (songData && musicNfts.length > 0) {
      // Auto-play when page loads
      handlePlayTrack(songData, musicNfts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, songData, musicNfts.length]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleToggleForSale = async () => {
    await toggleTrackForSale(id);
    setShowManageMenu(false);
    // Refresh track data
    window.location.reload();
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this track? This action cannot be undone."
      )
    ) {
      const success = await deleteTrack(id);
      if (success) {
        navigate(`/profile/${walletAddress}`);
      }
    }
    setShowManageMenu(false);
  };

  if (isPending) return <LoadingState />;
  if (isError || !songData) return <ErrorState />;

  const track = songData;

  return (
    <main className={styles.nowPlaying}>
      {/* Hero Section with Album Art */}
      <section className={styles.heroSection}>
        <div className={styles.albumArtContainer}>
          <img
            src={track.music_art}
            alt={track.title}
            className={styles.albumArt}
          />
          <div className={styles.vinylEffect}>
            <BsVinyl className={styles.vinylIcon} />
          </div>
        </div>

        <div className={styles.trackInfo}>
          <h1 className={styles.trackTitle}>{track.title}</h1>
          <p className={styles.artistName}>
            <span onClick={() => navigate(`/profile/${track.artist}`)}>
              {track.artist.slice(0, 6)}...{track.artist.slice(-4)}
            </span>
          </p>

          <div className={styles.trackMeta}>
            <span className={styles.metaItem}>
              {track.genre || "Unknown Genre"}
            </span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaItem}>{track.like_count} likes</span>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${hasVoted ? styles.voted : ""}`}
              onClick={() => voteForTrack(id, votersData)}
              disabled={hasVoted}
            >
              <FiHeart />
              {hasVoted ? "Voted" : "Vote"}
            </button>

            {forSale && !isOwner && (
              <button
                className={styles.actionBtn}
                onClick={() => setIsOpen(true)}
              >
                <FiShoppingCart />
                Buy {track.current_price / 100000000} MOVE
              </button>
            )}

            <button
              className={styles.actionBtn}
              onClick={() => setIsTipModalOpen(true)}
            >
              <FiDollarSign />
              Tip Artist
            </button>

            <button
              className={styles.actionBtn}
              onClick={() => setIsBoostModalOpen(true)}
            >
              <FiZap />
              Boost
            </button>

            <button className={styles.actionBtn} onClick={handleShare}>
              <FiShare2 />
              Share
            </button>

            {/* Owner Management Menu */}
            {isOwner && (
              <div className={styles.manageWrapper}>
                <button
                  className={`${styles.actionBtn} ${styles.manageBtn}`}
                  onClick={() => setShowManageMenu(!showManageMenu)}
                >
                  <FiMoreVertical />
                  Manage
                </button>
                {showManageMenu && (
                  <div className={styles.manageMenu}>
                    <button
                      className={styles.manageItem}
                      onClick={() => navigate(`/upload-music/${id}`)}
                    >
                      Edit Track
                    </button>
                    <button
                      className={styles.manageItem}
                      onClick={handleToggleForSale}
                    >
                      {forSale ? "Remove from Sale" : "List for Sale"}
                    </button>
                    <div className={styles.manageDivider}></div>
                    <button
                      className={`${styles.manageItem} ${styles.deleteItem}`}
                      onClick={handleDelete}
                    >
                      Delete Track
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isPremium && (
              <button
                className={styles.upgradeBtn}
                onClick={() => setIsSubcribeModalOpen(true)}
              >
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Track Details */}
      <section className={styles.detailsSection}>
        <div className={styles.detailCard}>
          <h3>Track Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Price</span>
              <span className={styles.infoValue}>
                {track.current_price / 100000000} MOVE
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Royalty</span>
              <span className={styles.infoValue}>
                {track.royalty_percentage / 100}%
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Quality</span>
              <span className={styles.infoValue}>
                {isPremium ? "320kbps" : "128kbps"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}>
                {forSale ? "For Sale" : "Not For Sale"}
              </span>
            </div>
          </div>
        </div>

        {/* Collaborators */}
        {track.collaborators && track.collaborators.length > 0 && (
          <div className={styles.detailCard}>
            <h3>Collaborators</h3>
            <div className={styles.collaboratorsList}>
              {track.collaborators.map((collab, index) => (
                <div key={index} className={styles.collaboratorItem}>
                  <span className={styles.collabAddress}>
                    {collab.slice(0, 6)}...{collab.slice(-4)}
                  </span>
                  <span className={styles.collabRole}>
                    {track.collaborator_roles?.[index] || "Collaborator"}
                  </span>
                  <span className={styles.collabSplit}>
                    {track.collaborator_splits?.[index] / 100}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* More from Artist */}
      {artistMusics.length > 0 && (
        <section className={styles.moreSection}>
          <h2 className={styles.sectionTitle}>
            More from {track.artist.slice(0, 6)}...{track.artist.slice(-4)}
          </h2>
          <div className={styles.musicGrid}>
            {artistMusics.map((track) => (
              <MusicCard
                key={track.id.id}
                track={track}
                quality={isPremium ? "Premium" : "Standard"}
                onPlay={(track) => handlePlayTrack(track, artistMusics)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <PremiumModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        songData={songData}
        onPurchase={() => purchaseTrack(id, track.current_price)}
      />

      <SubscribeModal
        isOpen={isSubcribeModalOpen}
        onClose={() => setIsSubcribeModalOpen(false)}
      />

      <TipArtistModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        nftId={id}
        artistAddress={track.artist}
        artistName={track.title}
      />

      <BoostSongModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        nftId={id}
        songTitle={track.title}
        currentBoostCount={track.boost_count}
      />
    </main>
  );
};

export default MusicPlayer;
