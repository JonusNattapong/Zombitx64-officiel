"use client";

import {
  Web3ReactProvider,
  Web3ReactHooks,
  initializeConnector,
} from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import type { Web3ProviderProps } from "@/lib/web3/types";
import React, {
  ReactNode,
  useEffect,
  createContext,
  useContext,
} from "react";
import { Connector, Web3ReactStateUpdate } from "@web3-react/types";
import { Web3Provider } from "@ethersproject/providers";

interface EvmProviderType {
  isConnected: boolean;
  account: string | null | undefined;
  chainId: number | null | undefined;
  provider: Web3Provider | null | undefined;
  connector: Connector | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

const EvmContext = createContext<EvmProviderType>({
  isConnected: false,
  account: null,
  chainId: null,
  provider: null,
  connector: null,
  connect: async () => {},
  disconnect: async () => {},
});

export function useEvm() {
  return useContext(EvmContext);
}

function EvmProvider({ children }: { children: ReactNode }) {
  const { useIsActive, useAccount, useChainId, useProvider } = hooks;

  const isConnected = useIsActive();
  const account = useAccount();
  const chainId = useChainId();
  const provider = useProvider();
  const connector = metaMask;

  const connect = async () => {
    try {
      await metaMask.activate();
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const disconnect = async () => {
    try {
      if (connector) {
        await connector.deactivate();
      }
    } catch (error) {
      console.error("Error disconnecting from MetaMask:", error);
    }
  };

  useEffect(() => {
    if (provider?.on) {
      const handleDisconnect = () => {
        console.log("MetaMask disconnected");
      };

      const handleAccountsChanged = (accounts: string[]) => {
        console.log("MetaMask account changed:", accounts);
      };

      const handleChainChanged = (chainId: string | number) => {
        console.log("MetaMask chain changed:", chainId);
      };

      provider.on("disconnect", handleDisconnect);
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("disconnect", handleDisconnect);
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [provider]);

  const value = {
    isConnected,
    account,
    chainId,
    provider,
    connector,
    connect,
    disconnect,
  };

  return <EvmContext.Provider value={value}>{children}</EvmContext.Provider>;
}

export function EvmProviderWrapper({ children }: Web3ProviderProps) {
  return (
    <Web3ReactProvider connectors={[[metaMask, hooks]]}>
      <EvmProvider>{children}</EvmProvider>
    </Web3ReactProvider>
  );
}

export { metaMask, hooks as evmHooks };