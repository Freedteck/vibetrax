import {
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
} from '@aptos-labs/ts-sdk';
import { aptos, CONTRACT_ADDRESS, toHex } from '../config/movement';

/**
 * Submit a transaction using Privy wallet with signRawHash
 * @param {string} functionName - Contract function name (e.g., "mint_music_nft")
 * @param {Array} functionArguments - Array of arguments for the function
 * @param {string} walletAddress - User's wallet address
 * @param {string} publicKeyHex - User's public key in hex
 * @param {Function} signRawHash - Privy's signRawHash function
 * @returns {Promise<string>} Transaction hash
 */
export const submitPrivyTransaction = async (
  functionName,
  functionArguments,
  walletAddress,
  publicKeyHex,
  signRawHash
) => {
  try {
    console.log(`[Privy Transaction] Starting ${functionName}:`, { 
      functionName, 
      walletAddress, 
      args: functionArguments 
    });

    // Build the transaction (user pays gas fees)
    const rawTxn = await aptos.transaction.build.simple({
      sender: walletAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::vibetrax::${functionName}`,
        typeArguments: [],
        functionArguments,
      },
    });

    console.log('[Privy Transaction] Transaction built successfully');

    // Generate signing message
    const message = generateSigningMessageForTransaction(rawTxn);
    console.log('[Privy Transaction] Signing message generated');

    // Sign with Privy wallet
    const { signature: rawSignature } = await signRawHash({
      address: walletAddress,
      chainType: 'aptos',
      hash: `0x${toHex(message)}`,
    });

    console.log('[Privy Transaction] Transaction signed successfully');

    // Clean public key (remove 0x prefix and any leading bytes)
    let cleanPublicKey = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;

    // If public key is 66 characters (33 bytes), remove the first byte (00 prefix)
    if (cleanPublicKey.length === 66) {
      cleanPublicKey = cleanPublicKey.slice(2);
    }

    const senderAuthenticator = new AccountAuthenticatorEd25519(
      new Ed25519PublicKey(cleanPublicKey),
      new Ed25519Signature(rawSignature.startsWith('0x') ? rawSignature.slice(2) : rawSignature)
    );

    console.log('[Privy Transaction] Submitting transaction to blockchain');

    // Submit the signed transaction
    const committedTransaction = await aptos.transaction.submit.simple({
      transaction: rawTxn,
      senderAuthenticator,
    });

    console.log('[Privy Transaction] Transaction submitted:', committedTransaction.hash);

    // Wait for confirmation
    const executed = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash,
    });

    if (!executed.success) {
      throw new Error('Transaction failed');
    }

    console.log('[Privy Transaction] Transaction confirmed successfully');

    return committedTransaction.hash;
  } catch (error) {
    console.error(`Error submitting ${functionName} transaction:`, error);
    throw error;
  }
};

/**
 * Submit transaction using native wallet adapter (for Nightly, etc.)
 * @param {string} functionName - Contract function name
 * @param {Array} functionArguments - Array of arguments for the function
 * @param {string} walletAddress - User's wallet address
 * @param {Function} signAndSubmitTransaction - Wallet adapter's signAndSubmitTransaction function
 * @returns {Promise<string>} Transaction hash
 */
export const submitNativeTransaction = async (
  functionName,
  functionArguments,
  walletAddress,
  signAndSubmitTransaction
) => {
  try {
    const response = await signAndSubmitTransaction({
      sender: walletAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::vibetrax::${functionName}`,
        functionArguments,
      },
    });

    console.log('Native wallet transaction response:', response);

    // Wait for transaction confirmation
    const executed = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    if (!executed.success) {
      throw new Error('Transaction failed');
    }

    return response.hash;
  } catch (error) {
    console.error(`Error submitting ${functionName} with native wallet:`, error);
    throw error;
  }
};

/**
 * Fetch data from blockchain view function
 * @param {string} functionName - View function name
 * @param {Array} functionArguments - Array of arguments for the function
 * @returns {Promise<any>} Function return value
 */
export const fetchViewFunction = async (functionName, functionArguments = []) => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::vibetrax::${functionName}`,
        typeArguments: [],
        functionArguments,
      },
    });

    return result;
  } catch (error) {
    console.error(`Error fetching ${functionName}:`, error);
    return null;
  }
};

/**
 * Helper to determine which wallet type is being used
 * @param {Object} privyUser - Privy user object
 * @param {Object} nativeAccount - Native wallet account object
 * @returns {Object} Wallet type information
 */
export const getWalletType = (privyUser, nativeAccount) => {
  const isPrivyWallet = !!privyUser?.linkedAccounts?.find(
    (acc) => acc.chainType === 'aptos'
  );
  const isNativeWallet = !!nativeAccount && !isPrivyWallet;

  return { isPrivyWallet, isNativeWallet };
};

/**
 * Get the appropriate transaction submitter based on wallet type
 * @param {Object} privyUser - Privy user object
 * @param {Object} nativeAccount - Native wallet account object
 * @param {Function} signRawHash - Privy's signRawHash function
 * @param {Function} signAndSubmitTransaction - Native wallet's signAndSubmitTransaction
 * @returns {Object} Submit function and wallet info
 */
export const getTransactionSubmitter = (
  privyUser,
  nativeAccount,
  signRawHash,
  signAndSubmitTransaction
) => {
  const { isPrivyWallet, isNativeWallet } = getWalletType(privyUser, nativeAccount);

  if (isPrivyWallet) {
    const moveWallet = privyUser.linkedAccounts.find(
      (acc) => acc.chainType === 'aptos'
    );

    if (!moveWallet) {
      throw new Error('Privy wallet not found');
    }

    return {
      submitTransaction: (functionName, functionArguments) =>
        submitPrivyTransaction(
          functionName,
          functionArguments,
          moveWallet.address,
          moveWallet.publicKey,
          signRawHash
        ),
      address: moveWallet.address,
      isPrivyWallet: true,
    };
  } else if (isNativeWallet) {
    return {
      submitTransaction: (functionName, functionArguments) =>
        submitNativeTransaction(
          functionName,
          functionArguments,
          nativeAccount.address.toString(),
          signAndSubmitTransaction
        ),
      address: nativeAccount.address.toString(),
      isNativeWallet: true,
    };
  }

  throw new Error('No wallet connected');
};
