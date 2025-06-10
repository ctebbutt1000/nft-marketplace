"use client";

import { Button, useDisclosure } from "@chakra-ui/react";
import { PaymentModal } from "../payment/PaymentModal";
import type { DirectListing } from "thirdweb/extensions/marketplace";

interface BuyWithStripeButtonProps {
  listing: DirectListing;
}

export function BuyWithStripeButton({ listing }: BuyWithStripeButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        colorScheme="green"
        onClick={onOpen}
        size="sm"
        ml={2}
      >
        Buy with Card
      </Button>
      <PaymentModal
        isOpen={isOpen}
        onClose={onClose}
        listing={listing}
      />
    </>
  );
}