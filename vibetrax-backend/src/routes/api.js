import express from "express";
import {
  trackStream,
  trackLike,
  removeLike,
  getUnclaimedRewards,
  markRewardsClaimed,
  getClaimHistory,
  getNftStats,
} from "../utils/tracking.js";

const router = express.Router();

/**
 * POST /api/streams
 * Track a stream event
 */
router.post("/streams", async (req, res) => {
  try {
    const { userAddress, nftAddress, duration } = req.body;

    if (!userAddress || !nftAddress || !duration) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userAddress, nftAddress, duration",
      });
    }

    // Validate duration (must be at least 30 seconds to count)
    if (duration < 30) {
      return res.status(400).json({
        success: false,
        error: "Stream duration must be at least 30 seconds",
      });
    }

    const ipAddress = req.ip || req.headers["x-forwarded-for"];
    const userAgent = req.headers["user-agent"];

    const result = await trackStream(
      userAddress,
      nftAddress,
      duration,
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/likes
 * Track a like event
 */
router.post("/likes", async (req, res) => {
  try {
    const { userAddress, nftAddress } = req.body;

    if (!userAddress || !nftAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userAddress, nftAddress",
      });
    }

    const result = await trackLike(userAddress, nftAddress);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/likes
 * Remove a like
 */
router.delete("/likes", async (req, res) => {
  try {
    const { userAddress, nftAddress } = req.body;

    if (!userAddress || !nftAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userAddress, nftAddress",
      });
    }

    const result = await removeLike(userAddress, nftAddress);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/rewards/:userAddress
 * Get unclaimed rewards for a user
 */
router.get("/rewards/:userAddress", async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing userAddress parameter",
      });
    }

    const result = await getUnclaimedRewards(userAddress);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/rewards/claim
 * Mark rewards as claimed after blockchain transaction
 */
router.post("/rewards/claim", async (req, res) => {
  try {
    const { userAddress, transactionHash } = req.body;

    if (!userAddress || !transactionHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userAddress, transactionHash",
      });
    }

    const result = await markRewardsClaimed(userAddress, transactionHash);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/rewards/history/:userAddress
 * Get claim history for a user
 */
router.get("/rewards/history/:userAddress", async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing userAddress parameter",
      });
    }

    const result = await getClaimHistory(userAddress);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/nfts/:nftAddress/stats
 * Get stats for a specific NFT
 */
router.get("/nfts/:nftAddress/stats", async (req, res) => {
  try {
    const { nftAddress } = req.params;

    if (!nftAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing nftAddress parameter",
      });
    }

    const result = await getNftStats(nftAddress);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
