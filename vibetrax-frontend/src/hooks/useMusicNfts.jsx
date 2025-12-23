import { useState, useEffect } from "react";
import { useNetworkVariable } from "../config/networkConfig";
import { aptos, CONTRACT_ADDRESS } from "../config/movement";

export const useMusicNfts = () => {
  const [musicNfts, setMusicNfts] = useState([]);
  const [isPending, setIsPending] = useState(true);
  const [isError, setIsError] = useState(false);
  const tunflowPackageId = useNetworkVariable("tunflowPackageId");

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setIsPending(true);
        setIsError(false);

        // Use Movement's indexer to fetch events
        // This queries the MusicNFTMinted events from your contract
        try {
          const events = await aptos.getAccountEventsByEventType({
            accountAddress: CONTRACT_ADDRESS,
            eventType: `${CONTRACT_ADDRESS}::vibetrax::MusicNFTMinted`,
          });

          console.log("Fetched events:", events);

          // Extract NFT data from events
          // Events should contain nft_id and other metadata
          const nfts = events.map((event) => ({
            id: { id: event.data.nft_id },
            ...event.data,
          }));

          setMusicNfts(nfts);
        } catch (eventError) {
          // If no events found or event type doesn't exist yet
          console.warn("No NFT events found:", eventError.message);
          setMusicNfts([]);
        }
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        setIsError(true);
      } finally {
        setIsPending(false);
      }
    };

    fetchNFTs();
  }, [tunflowPackageId]);

  return {
    musicNfts,
    isPending,
    isError,
  };
};
