/**
 * Example: Using Privy with Movement/Aptos
 *
 * This demonstrates the correct way to use Privy for Aptos/Movement chains
 */

import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { useMovementWallet } from "../hooks/useMovementWallet";

export function PrivyAptosExample() {
  const { ready, authenticated, user, logout } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { walletAddress, isPrivyWallet } = useMovementWallet();

  const { login } = useLogin({
    onComplete: async ({ user }) => {
      console.log("Login completed:", user);
      // After login, create Aptos wallet if needed
      const existingWallet = user.linkedAccounts?.find(
        (account) => account.chainType === "aptos"
      );

      if (!existingWallet) {
        console.log("Creating Aptos wallet...");
        await createWallet({ chainType: "aptos" });
      }
    },
  });

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Privy Aptos Wallet Example</h2>

      {!authenticated ? (
        <button onClick={() => login()}>Login with Privy</button>
      ) : (
        <div>
          <p>
            Authenticated:{" "}
            {user.email?.address || user.phone?.number || "Social Login"}
          </p>
          <p>Wallet Type: {isPrivyWallet ? "Privy Aptos" : "Native"}</p>
          <p>Address: {walletAddress || "Creating wallet..."}</p>

          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}

/**
 * Key Points:
 *
 * 1. Privy Config (in main.jsx):
 *    - Simple config with just loginMethods
 *    - NO supportedChains for Aptos (that's for EVM only)
 *
 * 2. After Login:
 *    - Use useCreateWallet hook from '@privy-io/react-auth/extended-chains'
 *    - Call createWallet({ chainType: 'aptos' })
 *    - This creates an embedded Aptos wallet
 *
 * 3. Signing Transactions:
 *    - Use useSignRawHash from '@privy-io/react-auth/extended-chains'
 *    - Build transaction with Aptos SDK
 *    - Generate signing message
 *    - Sign with signRawHash({ address, chainType: 'aptos', hash })
 *    - Submit signed transaction
 *
 * 4. Your useMovementWallet hook handles all this automatically!
 */
