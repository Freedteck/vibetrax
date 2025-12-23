import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import NowPlayingBar from "../../components/now-playing-bar/NowPlayingBar";
import styles from "./Root.module.css";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { fetchViewFunction } from "../../utils/transactions";

const Root = () => {
  const { walletAddress } = useMovementWallet();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [subscriberData, setSubscriberData] = useState(null);

  // Fetch subscription status when wallet connects
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!walletAddress) {
        setSubscriberData(null);
        return;
      }

      try {
        const subscription = await fetchViewFunction("get_user_subscription", [
          walletAddress,
        ]);
        setSubscriberData(subscription);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscriberData(null);
      }
    };

    fetchSubscription();
  }, [walletAddress]);

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
      <Toaster position="top-center" />

      <Sidebar />
      <Header />

      <main className={styles.mainContent}>
        <Outlet context={{ subscriberData, handlePlayTrack }} />
      </main>

      <NowPlayingBar
        currentTrack={currentTrack}
        playlist={playlist}
        onTrackChange={setCurrentTrack}
        onClose={handleClosePlayer}
      />
    </div>
  );
};

export default Root;
