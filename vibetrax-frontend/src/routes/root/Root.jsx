import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import NowPlayingBar from "../../components/now-playing-bar/NowPlayingBar";
import styles from "./Root.module.css";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { aptos } from "../../config/movement";
import { MOVEMENT_CONTRACT_ADDRESS } from "../../config/constants";

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
        // Query Subscriber resource directly from blockchain
        const subscriberResource = await aptos.getAccountResource({
          accountAddress: walletAddress,
          resourceType: `${MOVEMENT_CONTRACT_ADDRESS}::vibetrax::Subscriber`,
        });

        if (subscriberResource) {
          setSubscriberData({
            is_active: subscriberResource.is_active,
            subscription_start: parseInt(subscriberResource.subscription_start),
            subscription_end: parseInt(subscriberResource.subscription_end),
          });
        } else {
          setSubscriberData(null);
        }
      } catch (error) {
        // User doesn't have Subscriber resource yet
        console.log("No subscription found for user");
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
        subscriberData={subscriberData}
      />
    </div>
  );
};

export default Root;
