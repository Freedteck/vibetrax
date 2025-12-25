import { useState, useEffect } from "react";
import { aptos, CONTRACT_ADDRESS } from "../config/movement";

export const useMusicNfts = () => {
  const [musicNfts, setMusicNfts] = useState([]);
  const [isPending, setIsPending] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setIsPending(true);
        setIsError(false);

        // Fetch the NFTRegistry resource to get all NFT addresses
        const registryResource = await aptos.getAccountResource({
          accountAddress: CONTRACT_ADDRESS,
          resourceType: `${CONTRACT_ADDRESS}::vibetrax::NFTRegistry`,
        });

        const nftAddresses = registryResource.nft_addresses || [];

        if (nftAddresses.length === 0) {
          setMusicNfts([]);
          return;
        }

        // Fetch each NFT's data from its resource account
        const nftsData = await Promise.all(
          nftAddresses.map(async (nftAddress) => {
            try {
              const nftResource = await aptos.getAccountResource({
                accountAddress: nftAddress,
                resourceType: `${CONTRACT_ADDRESS}::vibetrax::MusicNFT`,
              });

              // Transform the data to match the expected format
              return {
                id: { id: nftAddress }, // Use NFT address as ID
                artist: nftResource.artist,
                current_owner: nftResource.current_owner,
                title: nftResource.title,
                description: nftResource.description,
                genre: nftResource.genre,
                music_art: nftResource.music_art,
                high_quality_ipfs: nftResource.high_quality_ipfs,
                low_quality_ipfs: nftResource.low_quality_ipfs,
                base_price: parseInt(nftResource.base_price),
                current_price: parseInt(nftResource.current_price),
                royalty_percentage: parseInt(nftResource.royalty_percentage),
                streaming_count: parseInt(nftResource.streaming_count),
                like_count: parseInt(nftResource.like_count),
                tip_count: parseInt(nftResource.tip_count),
                purchase_count: parseInt(nftResource.purchase_count),
                boost_count: parseInt(nftResource.boost_count),
                total_boost_amount: parseInt(nftResource.total_boost_amount),
                collaborators: nftResource.collaborators,
                collaborator_roles: nftResource.collaborator_roles,
                collaborator_splits: nftResource.collaborator_splits.map((s) =>
                  parseInt(s)
                ),
                status: nftResource.status.__variant__ || "Available",
                creation_time: parseInt(nftResource.creation_time),
              };
            } catch (err) {
              console.warn(
                `Failed to fetch NFT at ${nftAddress}:`,
                err.message
              );
              return null;
            }
          })
        );

        // Filter out any failed fetches
        const validNfts = nftsData.filter((nft) => nft !== null);

        setMusicNfts(validNfts);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        setIsError(true);
        setMusicNfts([]);
      } finally {
        setIsPending(false);
      }
    };

    fetchNFTs();
  }, []);

  return {
    musicNfts,
    isPending,
    isError,
  };
};
