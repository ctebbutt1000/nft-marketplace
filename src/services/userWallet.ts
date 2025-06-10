interface UserWallet {
  email: string;
  walletAddress: string;
  createdAt: Date;
}

// This is a simplified in-memory store for demo purposes
// In production, you'd use a proper database
const userWallets = new Map<string, UserWallet>();

export function storeUserWallet(email: string, walletAddress: string): void {
  userWallets.set(email.toLowerCase(), {
    email: email.toLowerCase(),
    walletAddress,
    createdAt: new Date(),
  });
}

export function getUserWallet(email: string): UserWallet | undefined {
  return userWallets.get(email.toLowerCase());
}

export function getUserWalletAddress(email: string): string | undefined {
  const wallet = getUserWallet(email);
  return wallet?.walletAddress;
}