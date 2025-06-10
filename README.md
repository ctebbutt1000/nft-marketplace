<p align="center">
    <br />
    <a href="https://thirdweb.com">
        <img src="https://github.com/thirdweb-dev/js/blob/main/legacy_packages/sdk/logo.svg?raw=true" width="200" alt=""/></a>
    <br />
</p>

<h1 align="center"><a href='https://thirdweb.com/'>thirdweb</a> NFT Marketplace with Universal Bridge</h1>

<p align="center"><strong>Build your own NFT Marketplace with thirdweb SDK, Stripe payments, Apple Pay, and Universal Bridge</strong></p>

## Features
- Support for multiple collections
- Support for multiple chains
- Create listings with custom payment currencies
- **Credit/Debit Card payments via Stripe**
- **Apple Pay integration**
- **ThirdWeb Universal Bridge integration**
- **In-app wallet creation with email**
- **ThirdWeb Engine for gasless transactions**
- **Multiple payment options: Crypto, Credit Card, Apple Pay, and Universal Bridge**
- Public profile page: [vitalik.eth's Profile](https://marketplace.thirdweb-preview.com/profile/vitalik.eth)
- _and [more to come](https://github.com/thirdweb-example/marketplace-template/issues?q=is%3Aissue+is%3Aopen+feature+request)_

Want to request a feature? [Create a GitHub issue!](https://github.com/thirdweb-example/marketplace-template/issues/new)

## Installation
### 1. Clone the template or [fork it](https://github.com/thirdweb-example/marketplace-template/fork)
```bash
git clone https://github.com/thirdweb-example/marketplace-template
```

### 2. Install the dependencies
```bash
# npm
npm install

# yarn
yarn

# pnpm
pnpm install
```

### 3. Set up environment variables
Create a file called `.env.local` (at the root level of your project) with the following content:
```
NEXT_PUBLIC_TW_CLIENT_ID="<your-thirdweb-client-id>"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="<your-stripe-publishable-key>"
STRIPE_SECRET_KEY="<your-stripe-secret-key>"
THIRDWEB_ENGINE_URL="<your-thirdweb-engine-url>"
THIRDWEB_ENGINE_ACCESS_TOKEN="<your-thirdweb-engine-access-token>"
THIRDWEB_ENGINE_BACKEND_WALLET="<your-backend-wallet-address>"
```

#### Required API Keys:
- **ThirdWeb Client ID**: [Get one here](https://thirdweb.com/dashboard/settings/api-keys)
- **Stripe Keys**: [Get them from Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **ThirdWeb Engine**: [Set up Engine](https://portal.thirdweb.com/engine)

### 4. You're set
You can now run the template in your local machine.
```bash
# npm
npm run dev

# yarn
yarn dev

# pnpm
pnpm dev
```

## Payment Options

### 1. Traditional Crypto Payments
- Direct wallet-to-wallet transactions
- Support for multiple ERC20 tokens
- Gas fees paid by buyer

### 2. Credit Card & Apple Pay Integration (Stripe)
- Users can purchase NFTs using credit/debit cards or Apple Pay
- Stripe handles secure payment processing
- Automatic wallet creation using email addresses
- NFTs are transferred directly to user's in-app wallet after successful payment

### 3. Universal Bridge Integration
- **Cross-chain payments**: Buy NFTs on any chain using any supported token
- **Fiat on-ramps**: Direct credit card to crypto conversion
- **Multi-chain support**: Seamless transactions across different networks
- **Gasless experience**: All gas fees covered by the marketplace
- **Apple Pay support**: Native Apple Pay integration through Universal Bridge

### In-App Wallets
- Email-based wallet creation
- No seed phrases or complex setup required
- Seamless integration with existing thirdweb wallet infrastructure
- Works with all payment methods

### ThirdWeb Engine Integration
- All gas fees are covered by the marketplace for Stripe and Universal Bridge payments
- Automatic NFT transfers after successful payments
- Support for both ERC721 and ERC1155 tokens

## How It Works

### Traditional Crypto Purchase
1. **Connect Wallet**: Users connect their existing crypto wallet
2. **Browse & Select**: Browse NFTs and click "Buy"
3. **Approve & Pay**: Approve token spending and complete transaction
4. **Receive**: NFT is transferred to user's wallet

### Credit Card/Apple Pay Purchase (Stripe)
1. **Browse & Select**: Users browse NFTs and click "Buy with Card"
2. **Email Wallet**: Enter email to create/connect in-app wallet
3. **Payment**: Pay with credit card or Apple Pay via Stripe
4. **Transfer**: NFT is automatically transferred to user's wallet using ThirdWeb Engine
5. **Complete**: User receives NFT in their in-app wallet

### Universal Bridge Purchase
1. **Browse & Select**: Users browse NFTs and click "Buy with Bridge"
2. **Email Wallet**: Enter email to create/connect in-app wallet (if needed)
3. **Universal Payment**: Pay with any supported token, credit card, or Apple Pay
4. **Cross-chain Magic**: Universal Bridge handles cross-chain conversion automatically
5. **Transfer**: NFT is transferred to user's wallet with all gas fees covered
6. **Complete**: User receives NFT regardless of payment method or chain

## Universal Bridge Benefits

- **Chain Abstraction**: Users don't need to worry about which chain the NFT is on
- **Token Flexibility**: Pay with any supported cryptocurrency or fiat
- **Simplified UX**: One payment flow for all scenarios
- **Lower Barriers**: No need to hold specific tokens or manage gas fees
- **Global Access**: Fiat on-ramps make NFTs accessible worldwide

## Customize your marketplace

### 1. Supported networks
This template allows you to build a marketplace that can handle multiple NFT collections from multiple networks. For each network you want to support, you need to deploy a [MarketplaceV3 contract](https://thirdweb.com/thirdweb.eth/MarketplaceV3) on that network.

To add a chain (network) to your marketplace, head to the file [`./src/consts/chains.ts`](./src/consts/chains.ts) and add that chain to the export array:
```typescript
export { ethereum, bsc } from "thirdweb/chains";
```
[Learn more about thirdweb Chains](https://portal.thirdweb.com/typescript/v5/chain)

If the chain you are looking is not in our [default list](https://portal.thirdweb.com/references/typescript/v5/variables), you can define your own chain using the `defineChain` method:

```typescript
// chain.ts
import { defineChain, ethereum, bsc } from "thirdweb/chains";

const yourChainId = 4747;
const yourCustomChain = defineChain(yourChainId);

export { ethereum, bsc, yourCustomChain }
```

### 2. Supported marketplaces

Once the marketplace contract deployment's completed, you need to put the MarketplaceV3 contract address and its respective chain in the file [`/src/consts/marketplace_contracts.ts`](/src/consts/marketplace_contract.ts)

Example:
```typescript
import { yourCustomChain, ethereum } from "./chains";

export const MARKETPLACE_CONTRACTS: MarketplaceContract[] = [
  {
    address: "your-marketplace-contrac-address-on-the-custom-chain",
    chain: yourCustomChain,
  },
  {
    address: "your-marketplace-contrac-address-on-ethereum",
    chain: ethereum,
  },
  // ... add more here
];
```

### 3. Supported payment currencies

thirdweb's MarketplaceV3 contract allows you to buy and sell NFTs in multiple currencies (ERC20 tokens) rather than just the native tokens like ETH, AVAX, MATIC etc.

If you want to support (or restrict) a only a few selected currencies for your marketplace, you need to do that via thirdweb Dashboard > you marketplace contract > Permission > Asset.

Once that is done, head over to the file [`./src/consts/supported_tokens.ts`](./src/consts/supported_tokens.ts) and fill in some basic info of those tokens that you aim to support. For example, the code below will add a dropdown to the UI for USDC and USDT, on the Avalanche Fuji network:

```typescript
export const SUPPORTED_TOKENS: SupportedTokens[] = [
  {
    chain: avalancheFuji,
    tokens: [
      {
        tokenAddress: "0x5425890298aed601595a70ab815c96711a31bc65",
        symbol: "USDC",
        icon: "/erc20-icons/usdc.png",
      },
      {
        tokenAddress: "0x82dcec6aa3c8bfe2c96d40d8805ee0da15708643",
        symbol: "USDT",
        icon: "/erc20-icons/usdt.png",
      },
      // Add more ERC20 here...
    ],
  },
]
```
You have to prepare your own icon assets for each token in this list.

## Webhook Configuration

### Universal Bridge Webhooks
To handle Universal Bridge payments, configure webhooks in your ThirdWeb dashboard:

1. Go to your ThirdWeb dashboard
2. Navigate to Pay settings
3. Add webhook URL: `https://your-domain.com/api/bridge-webhook`
4. Configure webhook events for payment completion

The webhook will automatically handle NFT transfers when Universal Bridge payments are completed.

## Support

For help or feedback, please [visit our support site](https://thirdweb.com/support)

## Additional Resources

- [Documentation](https://portal.thirdweb.com/typescript/v5)
- [ThirdWeb Universal Bridge](https://portal.thirdweb.com/pay)
- [Stripe Documentation](https://stripe.com/docs)
- [ThirdWeb Pay Documentation](https://portal.thirdweb.com/pay)

## Security

If you believe you have found a security vulnerability in any of our packages, we kindly ask you not to open a public issue; and to disclose this to us by emailing `security@thirdweb.com`.