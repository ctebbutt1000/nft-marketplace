import type { Chain } from "thirdweb";
import { polygon } from "./chains";

type MarketplaceContract = {
  address: string;
  chain: Chain;
};

/**
 * You need a marketplace contract on each of the chain you want to support
 * Only list one marketplace contract address for each chain
 */
export const MARKETPLACE_CONTRACTS: MarketplaceContract[] = [
  {
    address: "0xe01ac65a4DC25D32f632fB2166cAA5E749A241ba",
    chain: polygon,
  },
];