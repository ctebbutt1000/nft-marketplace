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
  Box,
  Divider,
  HStack,
  PinInput,
  PinInputField,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useInAppWallet } from "@/hooks/useInAppWallet";
import type { DirectListing } from "thirdweb/extensions/marketplace";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { PayEmbed } from "thirdweb/react";
import { client } from "@/consts/client";

interface UniversalBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: DirectListing;
}

export function UniversalBridgeModal({ isOpen, onClose, listing }: UniversalBridgeModalProps) {
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
  const { nftContract } = useMarketplaceContext();
  
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

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

  const handleReset = () => {
    resetVerification();
    setEmail("");
    setVerificationCode("");
  };

  const handlePaymentSuccess = async (result: any) => {
    try {
      toast({
        title: "Payment successful!",
        description: "Your NFT will be transferred to your wallet shortly.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error('Post-payment processing failed:', error);
      toast({
        title: "Payment completed but transfer pending",
        description: "Your payment was successful. The NFT transfer may take a few moments.",
        status: "warning",
        duration: 7000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Purchase with Universal Bridge</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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

            {isConnected && address && (
              <>
                <Text fontSize="sm" color="green.500" textAlign="center">
                  ✓ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </Text>

                <Box width="100%" minHeight="400px">
                  <PayEmbed
                    client={client}
                    payOptions={{
                      mode: "direct_payment",
                      paymentInfo: {
                        amount: listing.currencyValuePerToken.displayValue,
                        currency: "USD",
                        chain: nftContract.chain,
                        token: {
                          address: nftContract.address,
                          tokenId: listing.asset.id.toString(),
                        },
                        sellerAddress: listing.creatorAddress,
                      },
                      metadata: {
                        name: listing.asset.metadata.name || "NFT Purchase",
                        description: listing.asset.metadata.description || "",
                        image: listing.asset.metadata.image || "",
                      },
                    }}
                    onPaymentSuccess={handlePaymentSuccess}
                    style={{
                      width: "100%",
                      minHeight: "400px",
                    }}
                  />
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}