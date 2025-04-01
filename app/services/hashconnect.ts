'use client';

import { HashConnectTypes } from '@hashgraph/hashconnect';

declare global {
  interface Window {
    HashConnect: any;
  }
}

export class HashConnectService {
  private static instance: HashConnectService;
  private hashConnect: any;
  private state: any;
  private pairingData: any;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.hashConnect = window.HashConnect;
    }
  }

  static getInstance(): HashConnectService {
    if (!HashConnectService.instance) {
      HashConnectService.instance = new HashConnectService();
    }
    return HashConnectService.instance;
  }

  async init() {
    if (!this.hashConnect) {
      throw new Error('HashConnect not available');
    }

    try {
      this.state = await this.hashConnect.init({
        appMetadata: {
          name: 'Hedera Stock Trader',
          description: 'A decentralized stock trading platform on Hedera',
          icon: 'https://www.hedera.com/logo-capital-hbar-wordmark.png'
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize HashConnect:', error);
      return false;
    }
  }

  async connect() {
    if (!this.hashConnect) {
      throw new Error('HashConnect not available');
    }

    try {
      this.pairingData = await this.hashConnect.connect();
      return true;
    } catch (error) {
      console.error('Failed to connect with HashConnect:', error);
      return false;
    }
  }

  async disconnect() {
    if (!this.hashConnect) {
      throw new Error('HashConnect not available');
    }

    try {
      await this.hashConnect.disconnect();
      this.pairingData = null;
      return true;
    } catch (error) {
      console.error('Failed to disconnect from HashConnect:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return !!this.pairingData;
  }

  getAccountId(): string {
    if (!this.pairingData || !this.pairingData.accountIds || this.pairingData.accountIds.length === 0) {
      throw new Error('No account connected');
    }
    return this.pairingData.accountIds[0];
  }

  async sendTransaction(accountId: string, transaction: any) {
    if (!this.hashConnect) {
      throw new Error('HashConnect not available');
    }

    if (!this.isConnected()) {
      throw new Error('Not connected to HashPack');
    }

    try {
      return await this.hashConnect.sendTransaction(accountId, transaction);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }
}