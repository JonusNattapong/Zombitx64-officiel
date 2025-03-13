'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { MetaMaskConnector } from '@/lib/web3/connectors/metamask';
import { toast } from 'sonner';
import type { MetaMaskInpageProvider } from "@metamask/providers";

interface Web3ContextType {
  solanaPublicKey: PublicKey | null;
  connectSolana: () => Promise<void>;
  disconnectSolana: () => Promise<void>;
  metamask: MetaMaskConnector;
  ethereumAccount: string | null;
  ethereumChainId: number | null;
  connectMetaMask: () => Promise<void>;
  disconnectMetaMask: () => Promise<void>;
  isSolanaConnecting: boolean;
  isMetaMaskConnecting: boolean;
}

export const Web3Context = createContext<Web3ContextType>({
  solanaPublicKey: null,
  connectSolana: async () => {},
  disconnectSolana: async () => {},
  metamask: new MetaMaskConnector(),
  ethereumAccount: null,
  ethereumChainId: null,
  connectMetaMask: async () => {},
  disconnectMetaMask: async () => {},
  isSolanaConnecting: false,
  isMetaMaskConnecting: false,
});

export function Web3ContextProvider({ children }: { children: React.ReactNode }) {
  const { connect, disconnect, publicKey, connecting } = useWallet();
  const [solanaPublicKey, setSolanaPublicKey] = useState<PublicKey | null>(null);
  const [metamask] = useState(() => new MetaMaskConnector());
  const [ethereumAccount, setEthereumAccount] = useState<string | null>(null);
  const [ethereumChainId, setEthereumChainId] = useState<number | null>(null);
  const [isMetaMaskConnecting, setIsMetaMaskConnecting] = useState(false);

  useEffect(() => {
    setSolanaPublicKey(publicKey);
  }, [publicKey]);

  // Auto-connect to MetaMask if previously connected
  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      const ethereum = window.ethereum as unknown as MetaMaskInpageProvider;
      if (ethereum?.isMetaMask && ethereum?.request) {
        try {
          const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts?.[0]) {
            setEthereumAccount(accounts[0]);
            const chainId = await ethereum.request({ method: 'eth_chainId' }) as string;
            setEthereumChainId(parseInt(chainId, 16));
          }
        } catch (error) {
          console.error('Error checking MetaMask connection:', error);
        }
      }
    };
    checkMetaMaskConnection();
  }, []);

  const connectSolana = useCallback(async () => {
    try {
      if (!window?.solana?.isPhantom) {
        toast.error("Please install Phantom Wallet extension first.");
        return;
      }
      await connect();
    } catch (error: any) {
      console.error('Error connecting to Solana wallet:', error);
      toast.error(error.message || "Failed to connect to Solana wallet");
      throw error;
    }
  }, [connect]);

  const disconnectSolana = useCallback(async () => {
    try {
      await disconnect();
      setSolanaPublicKey(null);
    } catch (error: any) {
      console.error('Error disconnecting from Solana wallet:', error);
      toast.error(error.message || "Failed to disconnect from Solana wallet");
      throw error;
    }
  }, [disconnect]);

  const connectMetaMask = useCallback(async () => {
    try {
      setIsMetaMaskConnecting(true);
      const ethereum = window.ethereum as unknown as MetaMaskInpageProvider;
      if (!ethereum?.isMetaMask || !ethereum?.request) {
        toast.error("Please install MetaMask extension first.");
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (accounts?.[0]) {
        setEthereumAccount(accounts[0]);
        const chainId = await ethereum.request({
          method: 'eth_chainId'
        }) as string;
        setEthereumChainId(parseInt(chainId, 16));
        toast.success("Successfully connected to MetaMask");
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      toast.error(error.message || "Failed to connect to MetaMask");
      throw error;
    } finally {
      setIsMetaMaskConnecting(false);
    }
  }, []);

  const disconnectMetaMask = useCallback(async () => {
    try {
      setEthereumAccount(null);
      setEthereumChainId(null);
      toast.success("Successfully disconnected from MetaMask");
    } catch (error: any) {
      console.error('Error disconnecting from MetaMask:', error);
      toast.error(error.message || "Failed to disconnect from MetaMask");
      throw error;
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        solanaPublicKey,
        connectSolana,
        disconnectSolana,
        metamask,
        ethereumAccount,
        ethereumChainId,
        connectMetaMask,
        disconnectMetaMask,
        isSolanaConnecting: connecting,
        isMetaMaskConnecting,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
} 