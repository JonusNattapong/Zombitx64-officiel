"use client";

import { useState } from "react";
import { web3Hooks } from "@/components/providers/web3-provider";
import { Contract, createERC20Contract, createNFTContract } from "@/lib/web3/contracts";
import { ethers } from "ethers";

export default function BlockchainPage() {
  const { useAccounts, useProvider, useChainId } = web3Hooks;
  const accounts = useAccounts();
  const provider = useProvider();
  const chainId = useChainId();

  const [contractAddress, setContractAddress] = useState('');
  const [methodName, setMethodName] = useState('');
  const [callResult, setCallResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [args, setArgs] = useState('');
  const [value, setValue] = useState("");

  // Goerli Testnet
  const networkNames: { [key: number]: string } = {
    1: "Ethereum Mainnet",
    5: "Goerli Testnet",
    56: "BNB Smart Chain",
    137: "Polygon",
    43114: "Avalanche",
  };

  const usdtGoerliAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Example ERC20 (USDT on Goerli)
  const testNftGoerliAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"; // Example ERC721 (BAYC on Goerli)

  const handleCall = async () => {
    setError(null);
    setCallResult(null);

    if (!contractAddress || !methodName) {
      setError('Please enter a contract address and method name.');
      return;
    }

    try {
      const contract = new Contract({ address: contractAddress, abi: [] }); // ABI will be fetched later
      const argsArray = args.split(',').map((arg) => arg.trim());
      const result = await contract.call(methodName, ...argsArray);
      setCallResult(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSend = async () => {
    setError(null);
    setCallResult(null); // Reuse callResult to display transaction hash

    if (!contractAddress || !methodName) {
      setError('Please enter a contract address and method name.');
      return;
    }

    try {
      const contract = new Contract({ address: contractAddress, abi: [] }); // ABI will be fetched later
      const argsArray = args.split(',').map((arg) => arg.trim());
      const options = value ? { value: ethers.parseEther(value) } : {};
      const tx = await contract.send(methodName, options, ...argsArray);
      setCallResult(`Transaction hash: ${tx.hash}`);
    } catch (err: any) {
      setError(String(err));
    }
  };

  const handleERC20Balance = async () => {
    setError(null);
    setCallResult(null);
    if (!accounts || accounts.length === 0) {
      setError("Please connect your wallet.");
      return;
    }
    try {
      const erc20 = createERC20Contract(usdtGoerliAddress);
      if (!erc20.contract) {
        throw new Error("Failed to create ERC20 contract");
      }
      const balance = await erc20.contract.balanceOf(accounts[0]);
      setCallResult(`USDT Balance: ${ethers.formatUnits(balance, 6)}`); // USDT on Goerli has 6 decimals
    } catch (err) {
      setError(String(err));
    }
  };

  const handleNFTOwner = async () => {
    setError(null);
    setCallResult(null);

    if (!args) {
      setError("Please enter a token ID.");
      return;
    }

    try {
      const nft = createNFTContract(testNftGoerliAddress);
      if (!nft.contract) {
        throw new Error("Failed to create NFT contract");
      }
      const owner = await nft.contract.ownerOf(args);
      setCallResult(`Owner of token ${args}: ${owner}`);
    } catch (err) {
      setError(String(err));
    }
  };


  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Blockchain Details</h1>

      <div className="space-y-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Wallet Details</h2>
          {accounts?.length ? (
            <div className="space-y-2">
              <p>Connected Address: {accounts[0]}</p>
              <p>Network: {chainId ? networkNames[chainId] || `Chain ID: ${chainId}` : "Unknown"}</p>
            </div>
          ) : (
            <p>No wallet connected</p>
          )}
        </div>

        {provider && (
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Network Status</h2>
            <p>Provider Ready</p>
          </div>
        )}

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Contract Interaction</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700">
                Contract Address
              </label>
              <input
                type="text"
                id="contractAddress"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="methodName" className="block text-sm font-medium text-gray-700">
                Method Name
              </label>
              <input
                type="text"
                id="methodName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="args" className="block text-sm font-medium text-gray-700">
                Arguments (comma-separated)
              </label>
              <input
                type="text"
                id="args"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={args}
                onChange={(e) => setArgs(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                Value (ETH)
              </label>
              <input
                type="text"
                id="value"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleCall}
            >
              Call
            </button>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">ERC20 Example (USDT on Goerli)</h2>
          <div className="space-y-4">
            <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleERC20Balance}
            >
                Get USDT Balance
            </button>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">ERC721 Example (BAYC on Goerli)</h2>
          <div className="space-y-4">
           <div>
              <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700">
                Token ID (for OwnerOf)
              </label>
              <input
                type="text"
                id="tokenId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={args}
                onChange={(e) => setArgs(e.target.value)}
              />
            </div>
            <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleNFTOwner}
            >
                Get Owner
            </button>
          </div>
        </div>

        {callResult && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-md">
            <h3 className="text-lg font-semibold">Result:</h3>
            <pre className="whitespace-pre-wrap">{callResult}</pre>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
            <h3 className="text-lg font-semibold">Error:</h3>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
