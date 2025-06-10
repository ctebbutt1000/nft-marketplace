import { NextRequest, NextResponse } from 'next/server';
import { confirmPaymentIntent } from '@/services/stripe';
import { transferNFTViaEngine, transferERC1155ViaEngine } from '@/services/thirdwebEngine';
import { getUserWalletAddress } from '@/services/userWallet';
import { client } from '@/consts/client';
import { getContract } from 'thirdweb';
import { isERC1155 } from 'thirdweb/extensions/erc1155';
import { polygon } from '@/consts/chains';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Confirm payment was successful
    const paymentIntent = await confirmPaymentIntent(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    const metadata = paymentIntent.metadata;
    const {
      contractAddress,
      tokenId,
      chainId,
      buyerEmail,
      quantity,
    } = metadata;

    // Get buyer's wallet address from email
    const buyerWalletAddress = getUserWalletAddress(buyerEmail);
    
    if (!buyerWalletAddress) {
      return NextResponse.json(
        { error: 'Buyer wallet not found. Please ensure wallet was created properly.' },
        { status: 400 }
      );
    }

    // Check if contract is ERC1155 or ERC721
    const contract = getContract({
      address: contractAddress,
      chain: polygon, // You might need to dynamically determine the chain based on chainId
      client,
    });

    const isERC1155Contract = await isERC1155({ contract });

    // Transfer NFT using ThirdWeb Engine
    if (isERC1155Contract) {
      await transferERC1155ViaEngine({
        contractAddress,
        tokenId,
        to: buyerWalletAddress,
        chainId: parseInt(chainId),
        quantity: parseInt(quantity),
      });
    } else {
      await transferNFTViaEngine({
        contractAddress,
        tokenId,
        to: buyerWalletAddress,
        chainId: parseInt(chainId),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'NFT transferred successfully',
      walletAddress: buyerWalletAddress,
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}