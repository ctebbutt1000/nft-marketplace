import type { Chain } from "thirdweb";
import { polygon } from "./chains";

export type NftContract = {
  address: string;
  chain: Chain;
  type: "ERC1155" | "ERC721";

  title?: string;
  description?: string;
  thumbnailUrl?: string;
  slug?: string;
};

/**
 * Below is a list of all NFT contracts supported by your marketplace(s)
 * This is of course hard-coded for demo purpose
 *
 * In reality, the list should be dynamically fetched from your own data source
 */
export const NFT_CONTRACTS: NftContract[] = [
  {
    address: "0x0ECBE5853BB120252BcD84920FaC4E21CA1E9777", // Polygon Mainnet address
    chain: polygon,
    title: "Our First Artist",
    thumbnailUrl: "https://www.dropbox.com/scl/fi/zxf78k7ci4rfaqqxlr7vb/collection1.png?rlkey=px4v8k23ak576o9zl6yiij0n2&raw=1", // Fixed thumbnail URL
    type: "ERC721",
  },
  {
    address: "0xDA70b9C75e5446Af5932C4b47109D6EbA8b71E29", // Polygon Mainnet address
    chain: polygon,
    title: "Our Second Artist",
    thumbnailUrl: "https://www.dropbox.com/scl/fi/oue2xy837zkqk9b5v20kb/collection2.png?rlkey=ti9oz90p1msatfw3z5eipd899&raw=1", // Fixed thumbnail URL
    type: "ERC721",
  }
];

