import { NextRequest, NextResponse } from 'next/server';
import { storeUserWallet } from '@/services/userWallet';

export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress } = await request.json();

    if (!email || !walletAddress) {
      return NextResponse.json(
        { error: 'Email and wallet address are required' },
        { status: 400 }
      );
    }

    storeUserWallet(email, walletAddress);

    return NextResponse.json({
      success: true,
      message: 'Wallet stored successfully',
    });
  } catch (error) {
    console.error('Error storing wallet:', error);
    return NextResponse.json(
      { error: 'Failed to store wallet' },
      { status: 500 }
    );
  }
}