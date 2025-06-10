"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Box,
  Divider,
  HStack,
  Image,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { stripePromise } from "@/consts/stripe";
import { useInAppWallet } from "@/hooks/useInAppWallet";
import type { DirectListing } from "thirdweb/extensions/marketplace";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: DirectListing;
}

interface PaymentFormProps {
  listing: DirectListing;
  onClose: () => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function PaymentForm({ listing, onClose }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const { connectWithEmail, isConnected, address } = useInAppWallet();
  const { nftContract, type } = useMarketplaceContext();
  
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  // Initialize Apple Pay
  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: `${listing.asset.metadata.name}`,
          amount: Math.round(parseFloat(listing.currencyValuePerToken.displayValue) * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        }
      });

      pr.on('paymentmethod', async (ev) => {
        await handlePayment(ev.paymentMethod.id, ev.payerEmail || email);
        ev.complete('success');
      });
    }
  }, [stripe, listing]);

  const handlePayment = async (paymentMethodId?: string, userEmail?: string) => {
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    try {
      // Connect wallet if not connected
      if (!isConnected && userEmail) {
        await connectWithEmail(userEmail);
      }

      const finalEmail = userEmail || email;
      if (!finalEmail) {
        throw new Error("Email is required");
      }

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(listing.currencyValuePerToken.displayValue),
          listingId: listing.id.toString(),
          contractAddress: nftContract.address,
          tokenId: listing.asset.id.toString(),
          chainId: nftContract.chain.id,
          buyerEmail: finalEmail,
          quantity: Number(listing.quantity),
        }),
      });

      const { client_secret } = await response.json();

      let result;
      if (paymentMethodId) {
        // Apple Pay payment
        result = await stripe.confirmCardPayment(client_secret, {
          payment_method: paymentMethodId,
        });
      } else {
        // Card payment
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error("Card element not found");

        result = await stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: finalEmail,
            },
          },
        });
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Process the purchase
      await fetch('/api/process-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: result.paymentIntent.id,
        }),
      });

      toast({
        title: "Purchase successful!",
        description: "Your NFT will be transferred to your wallet shortly.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    await handlePayment(undefined, email);
  };

  return (
    <VStack spacing={6}>
      <Box textAlign="center">
        <Text fontSize="lg" fontWeight="bold">
          {listing.asset.metadata.name}
        </Text>
        <Text fontSize="2xl" color="purple.500">
          ${listing.currencyValuePerToken.displayValue}
        </Text>
      </Box>

      <FormControl>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          isRequired
        />
        <Text fontSize="sm" color="gray.500" mt={1}>
          We'll create an in-app wallet for you using this email
        </Text>
      </FormControl>

      {canMakePayment && paymentRequest && (
        <>
          <Box width="100%">
            <PaymentRequestButtonElement
              options={{ paymentRequest }}
              style={{
                paymentRequestButton: {
                  theme: 'dark',
                  height: '48px',
                },
              }}
            />
          </Box>
          <HStack width="100%">
            <Divider />
            <Text fontSize="sm" color="gray.500">OR</Text>
            <Divider />
          </HStack>
        </>
      )}

      <Box width="100%" p={4} border="1px" borderColor="gray.200" borderRadius="md">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </Box>

      <Button
        colorScheme="purple"
        size="lg"
        width="100%"
        onClick={handleCardPayment}
        isLoading={isProcessing}
        loadingText="Processing..."
        isDisabled={!email || !stripe || !elements}
      >
        Pay with Card
      </Button>

      {isConnected && address && (
        <Text fontSize="sm" color="green.500">
          ✓ Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
        </Text>
      )}
    </VStack>
  );
}

export function PaymentModal({ isOpen, onClose, listing }: PaymentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Complete Purchase</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Elements stripe={stripePromise}>
            <PaymentForm listing={listing} onClose={onClose} />
          </Elements>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}