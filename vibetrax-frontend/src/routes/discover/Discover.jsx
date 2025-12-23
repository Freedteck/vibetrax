import { useState, useEffect, useRef } from "react";
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import styles from "./Discover.module.css";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import { LoadingState } from "../../components/state/LoadingState";
import { ErrorState } from "../../components/state/ErrorState";
import { EmptyState } from "../../components/state/EmptyState";
import MusicCard from "../../components/cards/music-card/MusicCard";
import { useMovementWallet } from "../../hooks/useMovementWallet";

const Discover = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const [currentSlide, setCurrentSlide] = useState(0);
  const { subscriberData, handlePlayTrack } = useOutletContext();
  const { walletAddress } = useMovementWallet();
  const navigate = useNavigate();
  const carouselIntervalRef = useRef(null);

  const { musicNfts, isPending, isError } = useMusicNfts();

  const isSubscribed = subscriberData?.length > 0;
  const searchQuery = searchParams.get("search") || "";

  const genres = [
    "All Genres",
    "Pop",
    "HipHop",
    "R&B",
    "Rock",
    "Electronic",
    "Jazz",
    "Classical",
    "Afrobeat",
    "Latin",
  ];

  const featuredMusic = musicNfts
    .filter((track) => track.vote_count > 0)
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 5);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredMusic.length === 0) return;

    carouselIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMusic.length);
    }, 5000);

    return () => clearInterval(carouselIntervalRef.current);
  }, [featuredMusic.length]);

  const filteredMusic = musicNfts.filter((track) => {
    const tabMatch =
      activeTab === "all" ||
      (activeTab === "songs" && !track.is_album) ||
      (activeTab === "albums" && track.is_album);

    const genreMatch =
      activeGenre === "All Genres" ||
      track.genre?.toLowerCase() === activeGenre.toLowerCase();

    const searchMatch =
      searchQuery === "" ||
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && genreMatch && searchMatch;
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState />;

  return (
    <main className={styles.discover}>
      {/* Hero Carousel */}
      {featuredMusic.length > 0 && (
        <section className={styles.heroCarousel}>
          <div
            className={styles.carouselSlide}
            style={{
              backgroundImage: `url(${featuredMusic[currentSlide].music_art})`,
            }}
          >
            <div className={styles.carouselOverlay}>
              <div className={styles.carouselContent}>
                <span className={styles.featuredBadge}>Featured</span>
                <h1 className={styles.carouselTitle}>
                  {featuredMusic[currentSlide].title}
                </h1>
                <p className={styles.carouselArtist}>
                  {featuredMusic[currentSlide].artist.slice(0, 6)}...
                  {featuredMusic[currentSlide].artist.slice(-4)}
                </p>
                <div className={styles.carouselActions}>
                  <button
                    className={styles.playButton}
                    onClick={() => {
                      handlePlayTrack(
                        featuredMusic[currentSlide],
                        featuredMusic
                      );
                      navigate(
                        `/discover/${featuredMusic[currentSlide].id.id}`
                      );
                    }}
                  >
                    <FiPlay />
                    Play Now
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.carouselIndicators}>
            {featuredMusic.map((_, i) => (
              <button
                key={i}
                className={`${styles.indicator} ${
                  i === currentSlide ? styles.active : ""
                }`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Browse Section */}
      <section className={styles.browseSection}>
        {/* Filter Tabs */}
        <div className={styles.filterBar}>
          <div className={styles.tabs}>
            {["all", "songs", "albums"].map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${
                  activeTab === tab ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Pills */}
        <div className={styles.genreScroll}>
          {genres.map((genre) => (
            <button
              key={genre}
              className={`${styles.genrePill} ${
                activeGenre === genre ? styles.active : ""
              }`}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Music Grid */}
        {filteredMusic.length > 0 ? (
          <div className={styles.musicGrid}>
            {filteredMusic.map((track) => (
              <MusicCard
                key={track.id.id}
                track={track}
                quality={
                  currentAccount?.address === track?.current_owner ||
                  track?.collaborators?.includes(currentAccount?.address) ||
                  isSubscribed
                    ? "Premium"
                    : "Standard"
                }
                onPlay={(track) => handlePlayTrack(track, filteredMusic)}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No tracks found matching your filters" />
        )}
      </section>
    </main>
  );
};

export default Discover;
