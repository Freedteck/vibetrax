import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import NowPlayingBar from "../../components/now-playing-bar/NowPlayingBar";
import styles from "./Root.module.css";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import { useAppContext } from "../../hooks/useAppContext";

const Root = () => {
  const { isSubscribed, currentTrack, playlist, setCurrentTrack, setPlaylist } =
    useAppContext();

  // Create subscriberData object for backward compatibility
  const subscriberData = isSubscribed ? { is_active: true } : null;

  const handlePlayTrack = (track, trackList = []) => {
    setCurrentTrack(track);
    setPlaylist(trackList);
  };

  const handleClosePlayer = () => {
    setCurrentTrack(null);
    setPlaylist([]);
  };

  return (
    <div className={styles.root}>
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #333",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
          loading: {
            iconTheme: {
              primary: "#6366f1",
              secondary: "#fff",
            },
          },
        }}
      />

      <Sidebar subscriberData={subscriberData} />
      <Header />

      <main className={styles.mainContent}>
        <Outlet context={{ subscriberData, handlePlayTrack }} />
      </main>

      <NowPlayingBar
        currentTrack={currentTrack}
        playlist={playlist}
        onTrackChange={setCurrentTrack}
        onClose={handleClosePlayer}
        subscriberData={subscriberData}
      />
    </div>
  );
};

export default Root;
