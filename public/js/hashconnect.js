/**
 * Mock HashConnect Implementation
 * This is a simplified version for development without CORS issues
 */

(function(global) {
  console.log('Mock HashConnect loaded from backup location');

  // Define the HashConnect constructor
  function HashConnect() {
    this.state = null;
    this.pairingData = null;
    this.initialized = false;
    console.log('HashConnect instance created from backup location');
  }

  // Define HashConnect methods
  HashConnect.prototype.init = function(options) {
    console.log('HashConnect init called with options:', options);
    this.initialized = true;
    this.state = {
      topic: 'mock-topic-' + Math.random().toString(36).substring(2, 15),
      pairingString: 'mock-pairing-string',
      connectionState: 'Disconnected'
    };
    return Promise.resolve(this.state);
  };

  HashConnect.prototype.connect = function() {
    console.log('HashConnect connect called');
    if (!this.initialized) {
      return Promise.reject(new Error('HashConnect not initialized'));
    }
    
    this.pairingData = {
      accountIds: ['0.0.1234567'],
      network: 'testnet',
      topic: this.state.topic
    };
    
    this.state.connectionState = 'Connected';
    
    return Promise.resolve(this.pairingData);
  };

  HashConnect.prototype.disconnect = function() {
    console.log('HashConnect disconnect called');
    this.pairingData = null;
    this.state.connectionState = 'Disconnected';
    return Promise.resolve(true);
  };

  HashConnect.prototype.sendTransaction = function(accountId, transaction) {
    console.log('HashConnect sendTransaction called', { accountId, transaction });
    return Promise.resolve({
      success: true,
      receipt: {
        status: 'SUCCESS',
        transactionId: '0.0.1234567@1234567890.000000000',
      }
    });
  };

  // Define connection states
  HashConnect.prototype.ConnectionState = {
    Disconnected: 'Disconnected',
    Connecting: 'Connecting',
    Connected: 'Connected',
    Disconnecting: 'Disconnecting'
  };

  // Expose HashConnect to the global object
  global.HashConnect = HashConnect;

  // Trigger an event to notify that HashConnect is loaded
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new Event('hashconnect-ready'));
    
    // Also dispatch a global event that our components can listen for
    window.dispatchEvent(new Event('hashconnect-loaded'));
  }

})(typeof window !== 'undefined' ? window : global); 