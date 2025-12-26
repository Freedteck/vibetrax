import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import NowPlayingBar from "../../components/now-playing-bar/NowPlayingBar";
import styles from "./Root.module.css";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";
import { aptos } from "../../config/movement";
import { MOVEMENT_CONTRACT_ADDRESS } from "../../config/constants";
import { fetchAccountResourceWithFallback } from "../../utils/address";

const Root = () => {
  const { walletAddress } = useMovementWallet();
  const { isSubscribed, isLoading: isLoadingSubscription } =
    useSubscriptionStatus();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);

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
      <Toaster position="top-center" />

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
