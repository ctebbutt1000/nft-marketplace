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
  PinInput,
  PinInputField,
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
  const { 
    sendVerificationCode, 
    verifyAndConnect, 
    resetVerification,
    isVerificationSent, 
    pendingEmail,
    isConnected, 
    address 
  } = useInAppWallet();
  const { nftContract, type } = useMarketplaceContext();
  
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
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
        const userEmail = ev.payerEmail || email;
        if (userEmail && !isConnected) {
          try {
            await sendVerificationCode(userEmail);
            toast({
              title: "Verification required",
              description: "Please check your email for the verification code",
              status: "info",
              duration: 5000,
              isClosable: true,
            });
            ev.complete('fail');
            return;
          } catch (error) {
            ev.complete('fail');
            return;
          }
        }
        await handlePayment(ev.paymentMethod.id, userEmail);
        ev.complete('success');
      });
    }
  }, [stripe, listing, email, isConnected]);

  const handleSendVerificationCode = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSendingCode(true);
    try {
      await sendVerificationCode(email);
      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to send verification code",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    try {
      await verifyAndConnect(verificationCode);
      toast({
        title: "Wallet connected",
        description: "Your in-app wallet has been created and connected",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Invalid verification code",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async (paymentMethodId?: string, userEmail?: string) => {
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    try {
      const finalEmail = userEmail || pendingEmail || email;
      if (!finalEmail) {
        throw new Error("Email is required");
      }

      if (!isConnected) {
        throw new Error("Please connect your wallet first");
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
    await handlePayment();
  };

  const handleReset = () => {
    resetVerification();
    setEmail("");
    setVerificationCode("");
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

      {!isVerificationSent && !isConnected && (
        <>
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

          <Button
            colorScheme="purple"
            onClick={handleSendVerificationCode}
            isLoading={isSendingCode}
            loadingText="Sending..."
            isDisabled={!email}
            width="100%"
          >
            Send Verification Code
          </Button>
        </>
      )}

      {isVerificationSent && !isConnected && (
        <>
          <Box textAlign="center">
            <Text fontSize="md" mb={2}>
              Verification code sent to:
            </Text>
            <Text fontSize="sm" color="purple.500" fontWeight="bold">
              {pendingEmail}
            </Text>
          </Box>

          <FormControl>
            <FormLabel>Enter 6-digit verification code</FormLabel>
            <HStack justify="center">
              <PinInput
                value={verificationCode}
                onChange={setVerificationCode}
                size="lg"
              >
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
          </FormControl>

          <VStack width="100%" spacing={3}>
            <Button
              colorScheme="purple"
              onClick={handleVerifyCode}
              isLoading={isProcessing}
              loadingText="Verifying..."
              isDisabled={verificationCode.length !== 6}
              width="100%"
            >
              Verify & Connect Wallet
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleReset}
              size="sm"
            >
              Use different email
            </Button>
          </VStack>
        </>
      )}

      {isConnected && (
        <>
          <Text fontSize="sm" color="green.500" textAlign="center">
            ✓ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </Text>

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
            isDisabled={!stripe || !elements}
          >
            Pay with Card
          </Button>
        </>
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