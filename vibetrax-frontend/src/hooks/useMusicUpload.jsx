import { useMovementWallet } from "./useMovementWallet";
import { useNetworkVariables } from "../config/networkConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CONTRACT_ADDRESS } from "../config/movement";

export const useMusicUpload = () => {
  const navigate = useNavigate();
  const { tunflowPackageId, tunflowNFTRegistryId } = useNetworkVariables(
    "tunflowPackageId",
    "tunflowNFTRegistryId"
  );
  const { isConnected, signAndSubmitTransaction } = useMovementWallet();

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
      // TODO: Implement Movement transaction for uploading music
      // Use signAndSubmitTransaction from useMovementWallet
      // Call CONTRACT_ADDRESS::vibetrax::mint_music_nft with all parameters

      toast.dismiss(toastId);
      toast.error("Upload function not yet implemented for Movement");
      console.log("Upload parameters:", {
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
        collaboratorSplits,
        CONTRACT_ADDRESS,
      });
      return false;
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred, try again");
      console.log("catch error", error);
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
      // TODO: Implement Movement transaction for updating music
      // Use signAndSubmitTransaction from useMovementWallet
      // Call CONTRACT_ADDRESS::vibetrax::update_music_nft

      toast.dismiss(toastId);
      toast.error("Update function not yet implemented for Movement");
      console.log("Update parameters:", {
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
        collaboratorSplits,
        CONTRACT_ADDRESS,
      });
      return false;
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred, try again");
      console.log("catch error", error);
      return false;
    }
  };

  return { uploadMusic, updateMusic };
};
