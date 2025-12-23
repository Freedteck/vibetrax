import { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { FiPlus, FiCopy, FiMusic, FiTrendingUp } from "react-icons/fi";
import Button from "../../components/button/Button";
import MusicCard from "../../components/cards/music-card/MusicCard";
import styles from "./Profile.module.css";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import { LoadingState } from "../../components/state/LoadingState";
import { UnconnectedState } from "../../components/state/UnconnectedState";
import { ErrorState } from "../../components/state/ErrorState";
import { EmptyState } from "../../components/state/EmptyState";
import Jazzicon from "react-jazzicon";
import toast from "react-hot-toast";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { aptos } from "../../config/movement";

const Profile = () => {
  const [trackType, setTrackType] = useState("uploaded");
  const [userWalletBalance, setUserWalletBalance] = useState(null);
  const [balancePending, setBalancePending] = useState(true);
  const { address } = useParams();
  const { walletAddress } = useMovementWallet();
  const { subscriberData, handlePlayTrack } = useOutletContext();
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

  const uploadedNfts = musicNfts.filter((music) => music.artist === address);
  const ownedNfts = musicNfts.filter(
    (music) => music.current_owner === address && music.artist !== address
  );

  const totalVotes = uploadedNfts.reduce(
    (sum, track) => sum + (track.vote_count || 0),
    0
  );
  const isOwnProfile = walletAddress === address;

  if (isPending) return <LoadingState />;
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
                <span className={styles.statLabel}>Total Votes</span>
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
                    quality="Premium"
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
                  quality="Premium"
                  onPlay={(track) => handlePlayTrack(track, ownedNfts)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No owned tracks yet" />
          )}
        </div>
      </section>
    </main>
  );
};

export default Profile;
