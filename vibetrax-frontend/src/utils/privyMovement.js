/**
 * Utility functions for creating and managing Movement/Aptos wallets with Privy
 */

/**
 * Create a Movement/Aptos wallet for a Privy user
 * @param {Object} user - The Privy user object
 * @param {Function} createWallet - The createWallet function from useCreateWallet hook
 * @returns {Promise<Object>} The created wallet object with address
 */
export async function createMovementWallet(user, createWallet) {
  try {
    // Check if user already has an Aptos/Movement wallet
    const existingWallet = user?.linkedAccounts?.find(
      (account) => account.type === "wallet" && account.chainType === "aptos"
    );

    if (existingWallet) {
      console.log("Movement wallet already exists:", existingWallet.address);
      return existingWallet;
    }

    // Create a new Aptos/Movement wallet
    console.log("Creating new Movement wallet for user...");
    const wallet = await createWallet({ chainType: "aptos" });

    console.log("Movement wallet created successfully:", wallet.address);
    return wallet;
  } catch (error) {
    console.error("Error creating Movement wallet:", error);
    throw error;
  }
}

/**
 * Get the Movement wallet address from a Privy user
 * @param {Object} user - The Privy user object
 * @returns {string|null} The wallet address or null if not found
 */
export function getMovementWalletAddress(user) {
  if (!user?.linkedAccounts) return null;

  const wallet = user.linkedAccounts.find(
    (account) => account.type === "wallet" && account.chainType === "aptos"
  );

  return wallet?.address || null;
}

/**
 * Get the Movement wallet from a Privy user
 * @param {Object} user - The Privy user object
 * @returns {Object|null} The wallet object or null if not found
 */
export function getMovementWallet(user) {
  if (!user?.linkedAccounts) return null;

  return (
    user.linkedAccounts.find(
      (account) => account.type === "wallet" && account.chainType === "aptos"
    ) || null
  );
}
