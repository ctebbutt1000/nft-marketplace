import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/services/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      listingId,
      contractAddress,
      tokenId,
      chainId,
      buyerEmail,
      quantity,
    } = body;

    if (!amount || !listingId || !contractAddress || !tokenId || !chainId || !buyerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(
      amount,
      'usd',
      {
        listingId,
        contractAddress,
        tokenId,
        chainId: chainId.toString(),
        buyerEmail,
        quantity: quantity.toString(),
      }
    );

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}