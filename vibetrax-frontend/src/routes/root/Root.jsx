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
import { fetchAccountResourceWithFallback } from "../../utils/address";

const Root = () => {
  const { walletAddress } = useMovementWallet();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [subscriberData, setSubscriberData] = useState(null);

  // Fetch subscription status when wallet connects
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!walletAddress) {
        console.log("No wallet address, setting subscriberData to null");
        setSubscriberData(null);
        return;
      }

      try {
        // Use helper to fetch with address normalization fallback
        const subscriptionResource = await fetchAccountResourceWithFallback(
          aptos,
          walletAddress,
          `${MOVEMENT_CONTRACT_ADDRESS}::vibetrax::Subscription`
        );

        if (subscriptionResource) {
          // Subscription is a positional struct: Subscription(expiry_time, is_active)
          // API returns data with _0 and _1 properties
          const currentTime = Math.floor(Date.now() / 1000);
          const expiryTime = parseInt(
            subscriptionResource?._0 || subscriptionResource.vec?.[0] || 0
          );
          const isActive =
            subscriptionResource?._1 ?? subscriptionResource?._1 ?? false;

          const subscriberStatus = {
            is_active: isActive && expiryTime > currentTime,
            expiry_time: expiryTime,
          };

          setSubscriberData(subscriberStatus);
        } else {
          console.log("No subscription resource found");
          setSubscriberData(null);
        }
      } catch (error) {
        // User doesn't have Subscription resource yet - this is normal
        console.log("No subscription found for user", error);
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
