/**
 * Utility functions for creating and managing Movement wallets with Privy
 */

/**
 * Create a Movement wallet for a Privy user
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
