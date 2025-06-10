import type { Chain } from "thirdweb";
import { polygon } from "./chains";

export type Token = {
  tokenAddress: string;
  symbol: string;
  icon: string;
};

export type SupportedTokens = {
  chain: Chain;
  tokens: Token[];
};

/**
 * By default you create listings with the payment currency in the native token of the network (eth, avax, matic etc.)
 *
 * If you want to allow users to transact using different ERC20 tokens, you can add them to the config below
 * Keep in mind this is for front-end usage. Make sure your marketplace v3 contracts accept the ERC20s
 * check that in https://thirdweb.com/<chain-id>/<marketplace-v3-address>/permissions -> Asset
 * By default the Marketplace V3 contract supports any asset (token)
 */
export const SUPPORTED_TOKENS: SupportedTokens[] = [
  {
    chain: polygon,
    tokens: [
      {
        tokenAddress: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
        symbol: "USDC",
        icon: "https://www.dropbox.com/scl/fi/ikuu8rms5o3toddb25oto/usdc.png?rlkey=p473k152a4a7wpppw2ik54lqq&dl=0",
      },
    ],
  },

];

export const NATIVE_TOKEN_ICON_MAP: { [key in Chain["id"]]: string } = {
  1: "https://www.dropbox.com/scl/fi/islw5hcqa8jup14w5lasz/eth.png?rlkey=h16hf5ojr4gddghoxdl8sox9x&dl=0",
  [polygon.id]: "https://www.dropbox.com/scl/fi/islw5hcqa8jup14w5lasz/eth.png?rlkey=h16hf5ojr4gddghoxdl8sox9x&dl=0",

};
