import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { hederaConfig } from '../config/env';

// Initialize Hedera client
const client = Client.forName(hederaConfig.network);

// Set the default account ID and private key
client.setOperator(
  AccountId.fromString(hederaConfig.accountId),
  PrivateKey.fromString(hederaConfig.privateKey)
);

export { client }; 