import { useOutletContext, Link } from "react-router-dom";
import MusicCard from "../../components/cards/music-card/MusicCard";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import { LoadingState } from "../../components/state/LoadingState";
import { ErrorState } from "../../components/state/ErrorState";
import { EmptyState } from "../../components/state/EmptyState";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import styles from "./Home.module.css";

const Home = () => {
  const { subscriberData, handlePlayTrack } = useOutletContext();
  const { walletAddress } = useMovementWallet();
  const { musicNfts, isPending, isError } = useMusicNfts();

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

  if (isPending) return <LoadingState variant="cards" message="Loading featured tracks..." />;
  if (isError) return <ErrorState />;
  if (!musicNfts || musicNfts.length === 0) return <EmptyState />;

  // Get trending tracks (most voted)
  const trendingTracks = [...musicNfts]
    .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    .slice(0, 6);

  // Get recent uploads
  const recentTracks = [...musicNfts].reverse().slice(0, 6);

  // Get albums
  const albums = musicNfts.filter((track) => track.is_album).slice(0, 6);

  // Get popular artists (based on total votes)
  const artistMap = {};
  musicNfts.forEach((track) => {
    if (!artistMap[track.artist]) {
      artistMap[track.artist] = {
        address: track.artist,
        tracks: [],
        totalVotes: 0,
      };
    }
    artistMap[track.artist].tracks.push(track);
    artistMap[track.artist].totalVotes += track.like_count || 0;
  });

  const popularArtists = Object.values(artistMap)
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 6);

  return (
    <main className={styles.home}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Welcome to VibeTrax</h1>
          <p className={styles.heroSubtitle}>
            Discover, stream, and own music on the blockchain
          </p>
        </div>
      </section>

      {/* Trending Now */}
      {trendingTracks.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Trending Now</h2>
            <Link to="/discover" className={styles.seeAll}>
              See all
            </Link>
          </div>
          <div className={styles.grid}>
            {trendingTracks.map((track) => (
              <MusicCard
                key={track.id.id}
                track={track}
                quality={getQualityForTrack(track)}
                onPlay={(track) => handlePlayTrack(track, trendingTracks)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Added */}
      {recentTracks.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recently Added</h2>
            <Link to="/discover" className={styles.seeAll}>
              See all
            </Link>
          </div>
          <div className={styles.grid}>
            {recentTracks.map((track) => (
              <MusicCard
                key={track.id.id}
                track={track}
                quality={getQualityForTrack(track)}
                onPlay={(track) => handlePlayTrack(track, recentTracks)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Popular Albums */}
      {albums.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular Albums</h2>
            <Link to="/discover?filter=albums" className={styles.seeAll}>
              See all
            </Link>
          </div>
          <div className={styles.grid}>
            {albums.map((track) => (
              <MusicCard
                key={track.id.id}
                track={track}
                quality={getQualityForTrack(track)}
                onPlay={(track) => handlePlayTrack(track, albums)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Popular Artists */}
      {popularArtists.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular Artists</h2>
            <Link to="/discover" className={styles.seeAll}>
              See all
            </Link>
          </div>
          <div className={styles.artistGrid}>
            {popularArtists.map((artist) => (
              <Link
                key={artist.address}
                to={`/profile/${artist.address}`}
                className={styles.artistCard}
              >
                <div className={styles.artistAvatar}>
                  <div className={styles.avatarPlaceholder}>
                    {artist.address.slice(2, 4).toUpperCase()}
                  </div>
                </div>
                <h3 className={styles.artistName}>
                  {artist.address.slice(0, 6)}...{artist.address.slice(-4)}
                </h3>
                <p className={styles.artistMeta}>
                  {artist.tracks.length} tracks • {artist.totalVotes} votes
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Home;
