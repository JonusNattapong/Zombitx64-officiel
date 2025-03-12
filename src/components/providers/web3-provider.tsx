"use client";

import type { Web3ProviderProps } from "@/lib/web3/types";
import React, {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { SolanaConnector, connectSolana } from "@/lib/web3/connectors";
import { PublicKey } from "@solana/web3.js";
import { EvmProviderWrapper } from "./evm-provider";

declare global {
  interface Window {
    solana?: any;
  }
}

interface Web3ContextType {
  solanaIsConnected: boolean;
  solanaPublicKey: PublicKey | null;
  solanaConnector: SolanaConnector | null;
  connectSolana: () => Promise<void>;
  disconnectSolana: () => Promise<void>;
}

// Export the Web3Context
export const Web3Context = createContext<Web3ContextType>({
  solanaIsConnected: false,
  solanaPublicKey: null,
  solanaConnector: null,
  connectSolana: async () => {},
  disconnectSolana: async () => {},
});

export function useWeb3() {
  return useContext(Web3Context);
}

function Web3Provider({ children }: Web3ProviderProps) {
  const [solanaIsConnected, setSolanaIsConnected] = useState(false);
  const [solanaPublicKey, setSolanaPublicKey] = useState<PublicKey | null>(
    null
  );
  const [solanaConnector, setSolanaConnector] = useState<SolanaConnector | null>(
    null
  );

  const handleSolanaConnect = async () => {
    try {
      const solanaConnectorInstance = await connectSolana();
      const publicKey = solanaConnectorInstance.getPublicKey();
      setSolanaPublicKey(publicKey);
      setSolanaConnector(solanaConnectorInstance);
      setSolanaIsConnected(true);
    } catch (error) {
      console.error("Error connecting to Solana wallet:", error);
      setSolanaIsConnected(false);
    }
  };

  const handleSolanaDisconnect = async () => {
    try {
      if (solanaConnector) {
        await solanaConnector.disconnect();
      }
      setSolanaPublicKey(null);
      setSolanaConnector(null);
      setSolanaIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting Solana wallet:", error);
    }
  };

  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.solana?.isPhantom) {
        await handleSolanaConnect();
      }
    };

    checkExistingConnection();

    return () => {
      handleSolanaDisconnect();
    };
  }, []);

  const value = {
    solanaIsConnected,
    solanaPublicKey,
    solanaConnector,
    connectSolana: handleSolanaConnect,
    disconnectSolana: handleSolanaDisconnect,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

// Export the wrapper component that combines Web3ReactProvider and Web3Provider
export function Web3ProviderWrapper({ children }: Web3ProviderProps) {
  return (
      <EvmProviderWrapper>
          <Web3Provider>{children}</Web3Provider>
      </EvmProviderWrapper>
  );
}
