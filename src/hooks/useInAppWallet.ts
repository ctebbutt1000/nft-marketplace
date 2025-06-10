import { client } from "@/consts/client";
import { useActiveAccount, useConnect } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { useCallback, useState } from "react";

export function useInAppWallet() {
  const account = useActiveAccount();
  const { connect } = useConnect();
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const sendVerificationCode = useCallback(async (email: string) => {
    try {
      const wallet = inAppWallet();
      await wallet.connect({
        client,
        strategy: "email",
        email,
      });
      
      setIsVerificationSent(true);
      setPendingEmail(email);
      return true;
    } catch (error) {
      console.error("Failed to send verification code:", error);
      throw error;
    }
  }, []);

  const verifyAndConnect = useCallback(async (verificationCode: string) => {
    if (!pendingEmail) {
      throw new Error("No pending email verification");
    }

    try {
      const wallet = inAppWallet();
      await connect(async () => {
        await wallet.connect({
          client,
          strategy: "email",
          email: pendingEmail,
          verificationCode,
        });
        return wallet;
      });

      // Store the wallet address associated with the email
      const walletAccount = wallet.getAccount();
      if (walletAccount) {
        const walletAddress = walletAccount.address;
        if (walletAddress) {
          await fetch('/api/store-wallet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: pendingEmail,
              walletAddress,
            }),
          });
        }
      }

      setIsVerificationSent(false);
      setPendingEmail("");
      return true;
    } catch (error) {
      console.error("Failed to verify and connect:", error);
      throw error;
    }
  }, [connect, pendingEmail]);

  const resetVerification = useCallback(() => {
    setIsVerificationSent(false);
    setPendingEmail("");
  }, []);

  const isConnected = !!account;
  const address = account?.address;

  return {
    sendVerificationCode,
    verifyAndConnect,
    resetVerification,
    isVerificationSent,
    pendingEmail,
    isConnected,
    address,
    account,
  };
}