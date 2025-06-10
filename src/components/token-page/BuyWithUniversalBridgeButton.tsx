"use client";

import { Button, useDisclosure } from "@chakra-ui/react";
import { UniversalBridgeModal } from "../payment/UniversalBridgeModal";
import type { DirectListing } from "thirdweb/extensions/marketplace";

interface BuyWithUniversalBridgeButtonProps {
  listing: DirectListing;
}

export function BuyWithUniversalBridgeButton({ listing }: BuyWithUniversalBridgeButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        colorScheme="blue"
        onClick={onOpen}
        size="sm"
        ml={2}
      >
        Buy with Bridge
      </Button>
      <UniversalBridgeModal
        isOpen={isOpen}
        onClose={onClose}
        listing={listing}
      />
    </>
  );
}