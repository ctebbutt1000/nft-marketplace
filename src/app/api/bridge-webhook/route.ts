import { NextRequest, NextResponse } from 'next/server';
import { transferNFTViaEngine, transferERC1155ViaEngine } from '@/services/thirdwebEngine';
import { getUserWalletAddress } from '@/services/userWallet';
import { client } from '@/consts/client';
import { getContract } from 'thirdweb';
import { isERC1155 } from 'thirdweb/extensions/erc1155';
import { polygon } from '@/consts/chains';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify the webhook is from ThirdWeb (you should implement proper webhook verification)
    const {
      status,
      paymentInfo,
      buyerAddress,
      metadata,
    } = body;

    if (status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const {
      chain,
      token: { address: contractAddress, tokenId },
      sellerAddress,
    } = paymentInfo;

    // Get buyer's wallet address (should be the connected wallet from Universal Bridge)
    if (!buyerAddress) {
      return NextResponse.json(
        { error: 'Buyer address not found' },
        { status: 400 }
      );
    }

    // Check if contract is ERC1155 or ERC721
    const contract = getContract({
      address: contractAddress,
      chain: polygon, // You might need to dynamically determine the chain
      client,
    });

    const isERC1155Contract = await isERC1155({ contract });

    // Transfer NFT using ThirdWeb Engine
    if (isERC1155Contract) {
      await transferERC1155ViaEngine({
        contractAddress,
        tokenId,
        to: buyerAddress,
        chainId: chain.id,
        quantity: 1, // Default to 1 for Universal Bridge purchases
      });
    } else {
      await transferNFTViaEngine({
        contractAddress,
        tokenId,
        to: buyerAddress,
        chainId: chain.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'NFT transferred successfully via Universal Bridge',
      walletAddress: buyerAddress,
    });
  } catch (error) {
    console.error('Error processing Universal Bridge purchase:', error);
    return NextResponse.json(
      { error: 'Failed to process Universal Bridge purchase' },
      { status: 500 }
    );
  }
}