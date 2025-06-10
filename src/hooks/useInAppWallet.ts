import { client } from "@/consts/client";
import { useActiveAccount, useConnect } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { useCallback } from "react";

export function useInAppWallet() {
  const account = useActiveAccount();
  const { connect } = useConnect();

  const connectWithEmail = useCallback(async (email: string) => {
    const wallet = inAppWallet();
    await connect(async () => {
      await wallet.connect({
        client,
        strategy: "email",
        email,
      });
      return wallet;
    });

    // Store the wallet address associated with the email
    if (wallet.getAccount()) {
      const walletAddress = wallet.getAccount()?.address;
      if (walletAddress) {
        await fetch('/api/store-wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            walletAddress,
          }),
        });
      }
    }
  }, [connect]);

  const isConnected = !!account;
  const address = account?.address;

  return {
    connectWithEmail,
    isConnected,
    address,
    account,
  };
}