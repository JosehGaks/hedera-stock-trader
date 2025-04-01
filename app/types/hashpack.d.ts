interface HashConnectState {
  accountIds: string[];
  network: 'mainnet' | 'testnet';
  pairingString: string;
  pairingData: any;
}

interface HashConnect {
  init: () => Promise<HashConnectState>;
  connect: () => Promise<HashConnectState>;
  disconnect: () => Promise<void>;
  sendTransaction: (transaction: any) => Promise<any>;
}

declare global {
  interface Window {
    HashConnect: new () => HashConnect;
  }
}

export {}; 