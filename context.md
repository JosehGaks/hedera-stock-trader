# AfriStocks MVP Context File

## Project Overview
AfriStocks is a decentralized trading platform for African stock tokens built on Hedera blockchain technology. The platform enables users to trade tokenized versions of African stocks in a peer-to-peer manner using blockchain for security and transparency.

## Core Technology Stack
- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Node.js/Express
- **Database**: Firebase (Firestore)
- **Blockchain**: Hedera (HTS for tokens, HCS for trade logging)
- **Wallet Integration**: HashPack

## Key System Components

### Stock Tokens (Hedera Token Service)
- Each African stock has a corresponding HTS token (e.g., $Safaricom, $MTN)
- Tokens are created manually via script/admin portal before launch
- Token IDs are stored in Firestore for reference
- Initially using mock/placeholder prices for the MVP

### Trading Mechanism
- Simple Atomic Swap smart contract handles peer-to-peer trades
- Users can offer Token A for Token B at specified quantities
- Other users can accept open offers, triggering the swap

### Trade Logging (Hedera Consensus Service)
- All finalized trades are logged to HCS for transparency and auditability
- A dedicated Topic ID will be used for all trade records

### User Wallets
- HashPack integration for wallet connectivity
- Users connect their Hedera accounts to interact with the platform
- Private keys never leave the user's device (managed by HashPack)

## Data Model

### Firestore Collections
- **stocks**: { tokenId, name, symbol, description, logo, sector, country, mockPrice, priceHistory }
- **users**: { accountId, username, email, profileImage, joinDate, preferences }
- **trades**: { offerId, offererId, offerTokenId, offerAmount, requestTokenId, requestAmount, status, timestamp }
- **transactions**: { transactionId, type, participantIds, details, timestamp, consensusTimestamp }

## API Endpoints

### Stock Data
- `GET /api/stocks` - Fetch list of available stocks
- `GET /api/stocks/:symbol` - Fetch detailed information for a specific stock

### Trading
- `GET /api/trades/open` - Fetch all open swap offers
- `POST /api/trades/offer` - Create a new swap offer
- `POST /api/trades/accept/:offerId` - Accept an existing swap offer
- `DELETE /api/trades/:offerId` - Cancel an offer (only by creator)

### User
- `GET /api/user/:accountId/portfolio` - Get token balances for an account
- `GET /api/user/:accountId/trades` - Get trade history for an account

## Smart Contract (Atomic Swap)
```solidity
// Key functions in the AtomicSwap contract
function createOffer(address tokenA, uint256 amountA, address tokenB, uint256 amountB) external returns (uint256 offerId);
function acceptOffer(uint256 offerId) external;
function cancelOffer(uint256 offerId) external;
```

## User Experience Flow
1. **Onboarding**:
   - Connect HashPack wallet
   - View educational introduction to the platform
   - Set up basic profile information

2. **Browsing Stocks**:
   - View list of available African stocks
   - See basic information and current mock prices
   - Filter/search functionality

3. **Creating an Offer**:
   - Select token to offer and amount
   - Select token to receive and amount
   - Review and confirm the offer
   - Sign transaction with HashPack

4. **Trading**:
   - Browse open offers from other users
   - View offer details
   - Accept an offer
   - Sign transaction with HashPack
   - Receive confirmation

5. **Portfolio Management**:
   - View current token holdings
   - See transaction history
   - Track basic portfolio performance

## Design Principles
- **Simplicity First**: Focus on making core actions obvious and straightforward
- **Educational Elements**: Incorporate contextual learning throughout
- **Trust Building**: Design for transparency and security perception
- **Mobile Optimization**: Design mobile-first for African market realities
- **Cultural Relevance**: Incorporate familiar visual elements and terminology

## Implementation Phases

### Phase 1: Design & Planning (1-2 weeks)
- Complete user journey mapping
- Create UI/UX design system
- Finalize data models and API specifications

### Phase 2: Foundation Implementation (2-3 weeks)
- Set up development environments
- Configure Firebase and Hedera resources
- Implement core backend API endpoints
- Develop and deploy smart contract

### Phase 3: Frontend Development (3-4 weeks)
- Implement authentication flow
- Build dashboard and navigation
- Create trading interface
- Develop portfolio management views

### Phase 4: Integration & Testing (2-3 weeks)
- Connect frontend to backend APIs
- Integrate HashPack wallet
- Perform comprehensive testing
- Conduct user acceptance testing

### Phase 5: Refinement & Launch (2 weeks)
- Optimize performance
- Finalize documentation
- Set up monitoring
- Prepare launch checklist

## Development Guidelines
- Use TypeScript for type safety across the stack
- Follow Airbnb JavaScript Style Guide
- Implement responsive design for all components
- Write unit tests for critical functionality
- Document all API endpoints with JSDoc

## Security Considerations
- Implement proper input validation on all endpoints
- Use Firebase security rules for database access control
- Validate all blockchain transactions server-side
- Never store private keys on the server
- Implement rate limiting for API endpoints

## Performance Goals
- Initial page load under 2 seconds
- API response times under 500ms
- Smooth transitions between screens
- Support for low-bandwidth connections

## Future Roadmap (Post-MVP)
- Real market data integration
- Additional African markets
- Limit orders and advanced trading features
- Social/community features
- Mobile application