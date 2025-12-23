import { useMovementWallet } from "./useMovementWallet";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CONTRACT_ADDRESS } from "../config/movement";

export const useMusicUpload = () => {
  const navigate = useNavigate();
  const { isConnected, signAndSubmitTransaction, walletAddress } =
    useMovementWallet();

  const uploadMusic = async (
    toastId,
    title,
    description,
    genre,
    imageUrl,
    highQualityUrl,
    lowQualityUrl,
    price,
    royaltyPercentage,
    collaborators,
    collaboratorRoles,
    collaboratorSplits
  ) => {
    if (!isConnected) {
      toast.error("Please connect your wallet", { id: toastId });
      return false;
    }

    try {
      // The Aptos SDK automatically converts JavaScript primitives to BCS format
      // For vector<u8>, we can pass strings directly and SDK will encode them
      // For vector<address>, pass array of address strings
      // For vector<vector<u8>>, pass array of strings
      // For u64, pass numbers

      // Convert price to octas (Movement uses 8 decimals)
      const priceInOctas = Math.floor(price * 100_000_000);

      // Convert royalty percentage to basis points (e.g., 5% = 500)
      const royaltyBasisPoints = Math.floor(royaltyPercentage * 100);

      // Collaborator splits are already in basis points from Form component
      // (Form multiplies percentage by 100, e.g., 100% becomes 10000)

      console.log("Transaction arguments:", {
        title,
        description,
        genre,
        imageUrl,
        highQualityUrl,
        lowQualityUrl,
        priceInOctas,
        royaltyBasisPoints,
        collaborators,
        collaboratorRoles,
        collaboratorSplits,
      });

      const transaction = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::mint_music_nft`,
          typeArguments: [],
          functionArguments: [
            title, // vector<u8> - SDK converts string to bytes
            description, // vector<u8>
            genre, // vector<u8>
            imageUrl, // vector<u8>
            highQualityUrl, // vector<u8>
            lowQualityUrl, // vector<u8>
            priceInOctas, // u64
            royaltyBasisPoints, // u64
            collaborators, // vector<address> - array of address strings
            collaboratorRoles, // vector<vector<u8>> - array of strings
            collaboratorSplits, // vector<u64> - array of numbers (already basis points)
          ],
        },
      };

      const result = await signAndSubmitTransaction(transaction);

      toast.dismiss(toastId);
      toast.success("Music uploaded successfully!");
      console.log("Upload successful:", result);

      // Navigate to profile after successful upload
      setTimeout(() => navigate(`/profile/${walletAddress}`), 1500);

      return true;
    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage = error?.message || "An unexpected error occurred";
      toast.error(`Upload failed: ${errorMessage}`);
      console.error("Upload error:", error);
      return false;
    }
  };

  const updateMusic = async (
    toastId,
    id,
    title,
    description,
    genre,
    imageUrl,
    highQualityUrl,
    lowQualityUrl,
    price,
    forSale,
    collaborators,
    collaboratorRoles,
    collaboratorSplits
  ) => {
    if (!isConnected) {
      toast.error("Please connect your wallet", { id: toastId });
      return false;
    }

    try {
      // NFT address is the `id` parameter
      const nftAddress = id;

      // Convert strings to vector<u8>
      const titleBytes = title
        ? Array.from(new TextEncoder().encode(title))
        : [];
      const descriptionBytes = description
        ? Array.from(new TextEncoder().encode(description))
        : [];
      const imageBytes = imageUrl
        ? Array.from(new TextEncoder().encode(imageUrl))
        : [];
      const highQualityBytes = highQualityUrl
        ? Array.from(new TextEncoder().encode(highQualityUrl))
        : [];
      const lowQualityBytes = lowQualityUrl
        ? Array.from(new TextEncoder().encode(lowQualityUrl))
        : [];

      const transactions = [];

      // Update metadata if any metadata fields changed
      if (
        titleBytes.length > 0 ||
        descriptionBytes.length > 0 ||
        imageBytes.length > 0
      ) {
        transactions.push({
          data: {
            function: `${CONTRACT_ADDRESS}::vibetrax::update_nft_metadata`,
            typeArguments: [],
            functionArguments: [
              nftAddress,
              titleBytes,
              descriptionBytes,
              imageBytes,
            ],
          },
        });
      }

      // Update files if IPFS links changed
      if (highQualityBytes.length > 0 || lowQualityBytes.length > 0) {
        transactions.push({
          data: {
            function: `${CONTRACT_ADDRESS}::vibetrax::update_nft_files`,
            typeArguments: [],
            functionArguments: [nftAddress, highQualityBytes, lowQualityBytes],
          },
        });
      }

      // Update price if changed
      if (price) {
        const priceInOctas = Math.floor(price * 100_000_000);
        transactions.push({
          data: {
            function: `${CONTRACT_ADDRESS}::vibetrax::update_base_price`,
            typeArguments: [],
            functionArguments: [nftAddress, priceInOctas],
          },
        });
      }

      // Update listing status if changed
      if (typeof forSale === "boolean") {
        // Note: Contract uses toggle_for_sale, so we'd need to check current status first
        // For now, we'll skip this or you can add a view function to check current status
        // Then only call toggle if status needs to change
        transactions.push({
          data: {
            function: `${CONTRACT_ADDRESS}::vibetrax::toggle_for_sale`,
            typeArguments: [],
            functionArguments: [nftAddress],
          },
        });
      }

      // Execute all transactions
      for (const tx of transactions) {
        await signAndSubmitTransaction(tx);
      }

      toast.dismiss(toastId);
      toast.success("Music updated successfully!");

      return true;
    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage = error?.message || "An unexpected error occurred";
      toast.error(`Update failed: ${errorMessage}`);
      console.error("Update error:", error);
      return false;
    }
  };

  return { uploadMusic, updateMusic };
};
