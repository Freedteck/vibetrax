import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import NowPlayingBar from "../../components/now-playing-bar/NowPlayingBar";
import styles from "./Root.module.css";
import { useCurrentAccount, useIotaClientQuery } from "@iota/dapp-kit";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import { useNetworkVariable } from "../../config/networkConfig";

const Root = () => {
  const currentAccount = useCurrentAccount();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);

  const tunflowPackageId = useNetworkVariable("tunflowPackageId");

  const { data: subscriberData } = useIotaClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${tunflowPackageId}::vibetrax::SubscriptionPurchased`,
      },
    },
    {
      select: (data) =>
        data.data
          .flatMap((x) => x.parsedJson)
          .filter((y) => y.user === currentAccount?.address),
    }
  );

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
