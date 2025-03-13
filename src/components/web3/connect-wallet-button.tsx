"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '@/contexts/Web3Context';
import { analytics } from '@/lib/analytics';
import { truncateAddress } from '@/lib/utils';
import { Wallet, Loader2 } from 'lucide-react';

export function ConnectWalletButton() {
  const {
    solanaPublicKey,
    connectSolana,
    disconnectSolana,
    ethereumAccount,
    ethereumChainId,
    connectMetaMask,
    disconnectMetaMask,
    isSolanaConnecting,
    isMetaMaskConnecting,
  } = useContext(Web3Context);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track wallet state changes
  useEffect(() => {
    if (ethereumAccount && ethereumChainId) {
      analytics.trackEvent('wallet_connect', {
        type: 'ethereum',
        address: ethereumAccount,
        chainId: ethereumChainId,
      });
    }
  }, [ethereumAccount, ethereumChainId]);

  useEffect(() => {
    if (solanaPublicKey) {
      analytics.trackEvent('wallet_connect', {
        type: 'solana',
        address: solanaPublicKey.toBase58(),
      });
    }
  }, [solanaPublicKey]);

  const handleConnectMetaMask = async () => {
    try {
      setError('');
      await connectMetaMask();
    } catch (err: any) {
      console.error('Failed to connect MetaMask:', err);
      setError(err.message || 'Failed to connect MetaMask');
    }
  };

  const handleConnectSolana = async () => {
    try {
      setError('');
      await connectSolana();
    } catch (err: any) {
      console.error('Failed to connect Solana wallet:', err);
      setError(err.message || 'Failed to connect Solana wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      if (ethereumAccount) {
        await disconnectMetaMask();
      }
      if (solanaPublicKey) {
        await disconnectSolana();
      }
      setError('');
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
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

  const isConnecting = isSolanaConnecting || isMetaMaskConnecting;

  if (ethereumAccount || solanaPublicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {truncateAddress(ethereumAccount || solanaPublicKey?.toBase58() || '')}
        </span>
        <Button 
          onClick={handleDisconnect} 
          variant="outline" 
          size="sm"
          disabled={isConnecting}
        >
          {isConnecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Disconnect'
          )}
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isConnecting}>
          {isConnecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="mr-2 h-4 w-4" />
          )}
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={handleConnectMetaMask}
          disabled={isConnecting}
        >
          <img src="/metamask.svg" alt="MetaMask" className="w-4 h-4 mr-2" />
          MetaMask
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleConnectSolana}
          disabled={isConnecting}
        >
          <img src="/phantom.svg" alt="Phantom" className="w-4 h-4 mr-2" />
          Phantom (Solana)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
