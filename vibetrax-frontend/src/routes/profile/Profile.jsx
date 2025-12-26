import { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { FiPlus, FiCopy, FiMusic, FiTrendingUp, FiGift } from "react-icons/fi";
import Button from "../../components/button/Button";
import MusicCard from "../../components/cards/music-card/MusicCard";
import ClaimRewardsModal from "../../modals/claim-rewards-modal/ClaimRewardsModal";
import styles from "./Profile.module.css";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import { LoadingState } from "../../components/state/LoadingState";
import { UnconnectedState } from "../../components/state/UnconnectedState";
import { ErrorState } from "../../components/state/ErrorState";
import { EmptyState } from "../../components/state/EmptyState";
import Jazzicon from "react-jazzicon";
import toast from "react-hot-toast";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { useAppContext } from "../../hooks/useAppContext";
import { aptos } from "../../config/movement";

const Profile = () => {
  const [trackType, setTrackType] = useState("uploaded");
  const [userWalletBalance, setUserWalletBalance] = useState(null);
  const [balancePending, setBalancePending] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const { address } = useParams();
  const { walletAddress } = useMovementWallet();
  const { subscriberData, handlePlayTrack } = useOutletContext();
  const { unclaimedRewards, canClaimRewards } = useAppContext();
  const { musicNfts, isPending, isError } = useMusicNfts();
  const navigate = useNavigate();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address Copied");
    } catch (e) {
      toast.error("Error copying address");
      console.error(e);
    }
  };

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      try {
        setBalancePending(true);
        const balance = await aptos.getAccountAPTAmount({
          accountAddress: address,
        });
        setUserWalletBalance(balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setBalancePending(false);
      }
    };
    fetchBalance();
  }, [address]);

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

  const uploadedNfts = musicNfts.filter(
    (music) => normalizeAddress(music.artist) === normalizeAddress(address)
  );
  const ownedNfts = musicNfts.filter(
    (music) =>
      normalizeAddress(music.current_owner) === normalizeAddress(address) &&
      normalizeAddress(music.artist) !== normalizeAddress(address)
  );

  const totalVotes = uploadedNfts.reduce(
    (sum, track) => sum + (track.like_count || 0),
    0
  );
  const isOwnProfile =
    normalizeAddress(walletAddress) === normalizeAddress(address);

  const getQualityForTrack = (track) => {
    if (!walletAddress) return "Standard";

    // Normalize addresses: ensure 0x prefix and pad to 66 chars (0x + 64 hex chars)
    const normalizeAddress = (addr) => {
      if (!addr) return "";
      let normalized = addr.toLowerCase();
      if (!normalized.startsWith("0x")) normalized = "0x" + normalized;
      // Pad with zeros after 0x to make it 66 chars total
      if (normalized.length < 66) {
        normalized = "0x" + normalized.slice(2).padStart(64, "0");
      }
      return normalized;
    };

    const normalizedWallet = normalizeAddress(walletAddress);
    const normalizedArtist = normalizeAddress(track.artist);
    const normalizedOwner = normalizeAddress(track.current_owner);
    const normalizedCollaborators = track.collaborators?.map((c) =>
      normalizeAddress(c)
    );

    const isPremium =
      normalizedWallet === normalizedArtist ||
      normalizedWallet === normalizedOwner ||
      normalizedCollaborators?.includes(normalizedWallet) ||
      (subscriberData && subscriberData.is_active);
    return isPremium ? "Premium" : "Standard";
  };

  if (isPending) return <LoadingState variant="cards" message="Loading profile..." />;
  if (isError) return <ErrorState />;
  if (!walletAddress && isOwnProfile) return <UnconnectedState />;

  return (
    <main className={styles.profile}>
      {/* Profile Header */}
      <section className={styles.profileHeader}>
        <div className={styles.headerContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <Jazzicon diameter={180} seed={address} />
            </div>
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.addressContainer}>
              <h1 className={styles.profileName}>
                {`${address.slice(0, 8)}...${address.slice(-6)}`}
              </h1>
              <button className={styles.copyButton} onClick={handleCopy}>
                <FiCopy />
              </button>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{uploadedNfts.length}</span>
                <span className={styles.statLabel}>Tracks</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{totalVotes}</span>
                <span className={styles.statLabel}>Total Likes</span>
              </div>
              {!balancePending &&
                isOwnProfile &&
                userWalletBalance !== null && (
                  <div className={styles.stat}>
                    <span className={styles.statValue}>
                      {(userWalletBalance / 100_000_000).toFixed(2)}
                    </span>
                    <span className={styles.statLabel}>MOVE Balance</span>
                  </div>
                )}
              {isOwnProfile &&
                canClaimRewards &&
                unclaimedRewards.tokensEarned > 0 && (
                  <div
                    className={styles.claimStat}
                    onClick={() => setShowClaimModal(true)}
                  >
                    <div className={styles.claimIconWrapper}>
                      <FiGift />
                    </div>
                    <div className={styles.claimContent}>
                      <span className={styles.claimValue}>
                        {unclaimedRewards.tokensEarned}
                      </span>
                      <span className={styles.claimLabel}>Click to Claim</span>
                    </div>
                  </div>
                )}
            </div>

            {isOwnProfile && (
              <button
                className={styles.uploadButton}
                onClick={() => navigate("/upload")}
              >
                <FiPlus />
                Upload Track
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Music Section */}
      <section className={styles.musicSection}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              trackType === "uploaded" ? styles.active : ""
            }`}
            onClick={() => setTrackType("uploaded")}
          >
            <FiMusic />
            Uploaded ({uploadedNfts.length})
          </button>
          <button
            className={`${styles.tab} ${
              trackType === "owned" ? styles.active : ""
            }`}
            onClick={() => setTrackType("owned")}
          >
            <FiTrendingUp />
            Owned ({ownedNfts.length})
          </button>
        </div>

        {/* Music Grid */}
        <div className={styles.musicContent}>
          {trackType === "uploaded" ? (
            uploadedNfts.length > 0 ? (
              <div className={styles.musicGrid}>
                {uploadedNfts.map((track) => (
                  <MusicCard
                    key={track.id.id}
                    track={track}
                    quality={getQualityForTrack(track)}
                    onPlay={(track) => handlePlayTrack(track, uploadedNfts)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No uploaded tracks yet" />
            )
          ) : ownedNfts.length > 0 ? (
            <div className={styles.musicGrid}>
              {ownedNfts.map((track) => (
                <MusicCard
                  key={track.id.id}
                  track={track}
                  quality={getQualityForTrack(track)}
                  onPlay={(track) => handlePlayTrack(track, ownedNfts)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No owned tracks yet" />
          )}
        </div>
      </section>

      <ClaimRewardsModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
      />
    </main>
  );
};

export default Profile;
