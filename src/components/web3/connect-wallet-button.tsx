"use client";

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { web3Hooks, metaMask } from '@/components/providers/web3-provider';
import { MetaMask } from '@web3-react/metamask';
import { analytics } from '@/lib/analytics';

export function ConnectWalletButton() {
  const accounts = web3Hooks.useAccounts();
  const isActivating = web3Hooks.useIsActivating();
  const isActive = web3Hooks.useIsActive();
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track wallet state changes
  useEffect(() => {
    if (isActive && accounts?.[0]) {
      analytics.trackEvent('wallet_connect', { address: accounts[0] });
    }
  }, [isActive, accounts]);

  // Handle connection
  const handleConnect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Please install MetaMask');
      return;
    }

    try {
      setError('');
      await metaMask.activate();
    } catch (err: any) {
      let errorMessage = 'Failed to connect wallet';
      
      // Handle specific error cases
      if (err.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (err.code === -32002) {
        errorMessage = 'Connection request pending';
      }
      
      setError(errorMessage);
      console.error('Connection Error:', err);
      analytics.trackEvent('error', { type: 'wallet_connection', error: err });
    }
  };

  // Handle disconnection
  const handleDisconnect = () => {
    try {
      void metaMask.resetState();
      analytics.trackEvent('wallet_disconnect');
    } catch (err) {
      console.error('Disconnection Error:', err);
      analytics.trackEvent('error', { type: 'wallet_disconnection', error: err });
    }
  };

  // Format account address for display
  const formatAccount = (account: string) => {
    return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
  };

  // Prevent hydration issues
  if (!mounted) {
    return null;
  }

  if (error) {
    return (
      <Button variant="destructive" onClick={() => setError('')}>
        {error}
      </Button>
    );
  }

  if (isActivating) {
    return (
      <Button disabled>
        Connecting...
      </Button>
    );
  }

  if (isActive && accounts?.[0]) {
    return (
      <Button onClick={handleDisconnect}>
        {formatAccount(accounts[0])}
      </Button>
    );
  }

  return (
    <Button onClick={handleConnect}>
      Connect Wallet
    </Button>
  );
}
