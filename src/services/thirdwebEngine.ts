const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL!;
const ENGINE_ACCESS_TOKEN = process.env.THIRDWEB_ENGINE_ACCESS_TOKEN!;
const BACKEND_WALLET = process.env.THIRDWEB_ENGINE_BACKEND_WALLET!;

interface TransferNFTParams {
  contractAddress: string;
  tokenId: string;
  to: string;
  chainId: number;
  quantity?: number;
}

export async function transferNFTViaEngine({
  contractAddress,
  tokenId,
  to,
  chainId,
  quantity = 1,
}: TransferNFTParams) {
  const response = await fetch(`${ENGINE_URL}/contract/${chainId}/${contractAddress}/erc721/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ENGINE_ACCESS_TOKEN}`,
      'x-backend-wallet-address': BACKEND_WALLET,
    },
    body: JSON.stringify({
      to,
      tokenId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Engine transfer failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function transferERC1155ViaEngine({
  contractAddress,
  tokenId,
  to,
  chainId,
  quantity,
}: TransferNFTParams) {
  const response = await fetch(`${ENGINE_URL}/contract/${chainId}/${contractAddress}/erc1155/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ENGINE_ACCESS_TOKEN}`,
      'x-backend-wallet-address': BACKEND_WALLET,
    },
    body: JSON.stringify({
      to,
      tokenId,
      amount: quantity.toString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Engine transfer failed: ${response.statusText}`);
  }

  return await response.json();
}