import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiShare2,
  FiShoppingCart,
  FiMoreVertical,
} from "react-icons/fi";
import { BsVinyl } from "react-icons/bs";
import styles from "./MusicPlayer.module.css";
import { LoadingState } from "../../components/state/LoadingState";
import { ErrorState } from "../../components/state/ErrorState";
import { useMusicActions } from "../../hooks/useMusicActions";
import PremiumModal from "../../modals/premium-modal/PremiumModal";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import MusicCard from "../../components/cards/music-card/MusicCard";
import { useNetworkVariable } from "../../config/networkConfig";
import SubscribeModal from "../../modals/subscribe-modal/SubscribeModal";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { fetchViewFunction } from "../../utils/transactions";
import { aptos, CONTRACT_ADDRESS } from "../../config/movement";
import toast from "react-hot-toast";

const MusicPlayer = () => {
  const { id } = useParams();
  const { subscriberData, handlePlayTrack } = useOutletContext();
  const { walletAddress } = useMovementWallet();
  const navigate = useNavigate();
  const { voteForTrack, purchaseTrack } = useMusicActions();
  const tunflowPackageId = useNetworkVariable("tunflowPackageId");

  const [isOpen, setIsOpen] = useState(false);
  const [isSubcribeModalOpen, setIsSubcribeModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [votersData, setVotersData] = useState([]);
  const [songData, setSongData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [isError, setIsError] = useState(false);

  const { musicNfts, isPending: artistMusicPending } = useMusicNfts();

  // Fetch song data and voter data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setIsPending(true);
        setIsError(false);

        // Fetch NFT data using view function
        const nftData = await fetchViewFunction(
          CONTRACT_ADDRESS,
          "get_nft_details",
          [],
          [id]
        );

        if (nftData) {
          setSongData({ fields: nftData });
        }

        // Fetch voter events if wallet connected
        if (walletAddress) {
          // TODO: Implement event fetching or voting status check
          // For now, initialize as empty
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

  const artistMusics = musicNfts
    .filter(
      (music) =>
        music.artist === songData?.fields?.artist && music?.id?.id !== id
    )
    .slice(0, 6);

  const forSale = songData?.fields?.for_sale === true;

  const isPremium =
    walletAddress === songData?.fields?.current_owner ||
    songData?.fields?.collaborators?.includes(walletAddress) ||
    (subscriberData && subscriberData.length > 0);

  const hasVoted = votersData && votersData.length > 0;

  useEffect(() => {
    if (songData && musicNfts.length > 0) {
      // Auto-play when page loads
      handlePlayTrack(
        {
          ...songData.fields,
          id: { id },
        },
        musicNfts
      );
    }
  }, [id, songData, musicNfts.length]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (isPending) return <LoadingState />;
  if (isError || !songData) return <ErrorState />;

  const track = songData.fields;

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
            <span className={styles.metaItem}>{track.vote_count} votes</span>
            {track.is_album && (
              <>
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaItem}>Album</span>
              </>
            )}
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

            {forSale && (
              <button
                className={styles.actionBtn}
                onClick={() => setIsOpen(true)}
              >
                <FiShoppingCart />
                Buy {track.price} IOTA
              </button>
            )}

            <button className={styles.actionBtn} onClick={handleShare}>
              <FiShare2 />
              Share
            </button>

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
              <span className={styles.infoValue}>{track.price} IOTA</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Royalty</span>
              <span className={styles.infoValue}>
                {track.royalty_percentage}%
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
                    {track.collaborator_splits?.[index]}%
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
        onPurchase={() => purchaseTrack(id, track.price)}
      />

      <SubscribeModal
        isOpen={isSubcribeModalOpen}
        onClose={() => setIsSubcribeModalOpen(false)}
      />
    </main>
  );
};

export default MusicPlayer;
