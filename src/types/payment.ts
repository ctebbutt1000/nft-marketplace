export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PurchaseRequest {
  listingId: string;
  quantity: number;
  buyerEmail: string;
  buyerWalletAddress: string;
  contractAddress: string;
  tokenId: string;
  chainId: number;
}

export interface PaymentMethod {
  type: 'card' | 'apple_pay';
  card?: {
    brand: string;
    last4: string;
  };
}