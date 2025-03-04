"use client";

import { Button } from '@/components/ui/button';
import React, { useState, useEffect, useContext } from 'react';
import { web3Hooks, metaMask, Web3Context } from '@/components/providers/web3-provider';
import { MetaMask } from '@web3-react/metamask';
import { analytics } from '@/lib/analytics';

type WalletType = 'metamask' | 'solana';

export function ConnectWalletButton() {
  const { solanaConnector, solanaPublicKey, connectSolana, disconnectSolana } = useContext(Web3Context);
  const accounts = web3Hooks.useAccounts();
  const isActivating = web3Hooks.useIsActivating();
  const isActive = web3Hooks.useIsActive();
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>('metamask');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track MetaMask wallet state changes
  useEffect(() => {
    if (isActive && accounts?.[0]) {
      analytics.trackEvent('wallet_connect', { type: 'metamask', address: accounts[0] });
    }
  }, [isActive, accounts]);

  // Track Solana wallet state changes
  useEffect(() => {
    if (solanaPublicKey) {
      analytics.trackEvent('wallet_connect', { type: 'solana', address: solanaPublicKey.toBase58() });
    }
  }, [solanaPublicKey]);

  // Handle connection
  const handleConnect = async () => {
    setError('');
    
    try {
      if (walletType === 'metamask') {
        if (typeof window === 'undefined' || !window.ethereum) {
          setError('Please install MetaMask');
          return;
        }
        await metaMask.activate();
      } else {
        if (typeof window === 'undefined' || !window.solana) {
          setError('Please install Phantom wallet');
          return;
        }
        await connectSolana();
      }
    } catch (err: any) {
      let errorMessage = `Failed to connect ${walletType} wallet`;
      
      // Handle specific error cases
      if (err.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (err.code === -32002) {
        errorMessage = 'Connection request pending';
      }
      
      setError(errorMessage);
      console.error('Connection Error:', err);
      analytics.trackEvent('error', { type: 'wallet_connection', wallet: walletType, error: err });
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    try {
      if (walletType === 'metamask') {
        void metaMask.resetState();
      } else {
        await disconnectSolana();
      }
      analytics.trackEvent('wallet_disconnect', { type: walletType });
    } catch (err) {
      console.error('Disconnection Error:', err);
      analytics.trackEvent('error', { type: 'wallet_disconnection', wallet: walletType, error: err });
    }
  };

  // Format account address for display
  const formatAccount = (account: string) => {
    return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
  };

  const toggleWalletType = () => {
    setWalletType(current => current === 'metamask' ? 'solana' : 'metamask');
    setError('');
  };

  // Prevent hydration issues
  if (!mounted) {
    return null;
  }

  const getConnectedAddress = () => {
    if (walletType === 'metamask' && accounts?.[0]) {
      return formatAccount(accounts[0]);
    }
    if (walletType === 'solana' && solanaPublicKey) {
      return formatAccount(solanaPublicKey.toBase58());
    }
    return null;
  };

  const isConnected = walletType === 'metamask' ? isActive : !!solanaPublicKey;
  const connectedAddress = getConnectedAddress();

  if (error) {
    return (
      <div className="space-y-2">
        <Button variant="destructive" onClick={() => setError('')}>
          {error}
        </Button>
        <Button variant="outline" size="sm" onClick={toggleWalletType}>
          Switch to {walletType === 'metamask' ? 'Solana' : 'MetaMask'}
        </Button>
      </div>
    );
  }

  if (isActivating && walletType === 'metamask') {
    return (
      <Button disabled>
        Connecting to MetaMask...
      </Button>
    );
  }

  if (isConnected && connectedAddress) {
    return (
      <div className="space-y-2">
        <Button onClick={handleDisconnect}>
          {connectedAddress} ({walletType === 'metamask' ? 'MetaMask' : 'Solana'})
        </Button>
        <Button variant="outline" size="sm" onClick={toggleWalletType}>
          Switch to {walletType === 'metamask' ? 'Solana' : 'MetaMask'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleConnect}>
        Connect {walletType === 'metamask' ? 'MetaMask' : 'Solana'}
      </Button>
      <Button variant="outline" size="sm" onClick={toggleWalletType}>
        Switch to {walletType === 'metamask' ? 'Solana' : 'MetaMask'}
      </Button>
    </div>
  );
}
