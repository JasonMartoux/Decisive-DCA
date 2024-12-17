import { createContext, useContext, useEffect, useState } from 'react';
import { useActiveAccount } from "thirdweb/react";
import { useReadContract } from "thirdweb/react";
import { getContract, toTokens } from "thirdweb";
import { chain } from '@/app/chain';
import { client } from '@/app/client';
import { getBalance, decimals as getDecimals, allowance as getAllowance} from 'thirdweb/extensions/erc20';

// Define the shape of the context value
interface TokenContextType {
  validateTorexAndFetchTokenInfo: (
    torexAddr: string,
    address: string
  ) => Promise<{ balance: string; allowance: string; }>;
  inTokenAddress: string | null;
  underlyingTokenAddress: string | null;
  tokenBalance: string;
  tokenAllowance: string;
}

// Create the context with a default value of null
const TokenContext = createContext<TokenContextType | null>(null);

const erc20ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function decimals() external view returns (uint8)',
];

const torexABI = [
  'function getPairedTokens() external view returns (address inToken, address outToken)',
];

const superTokenABI = [
  'function getUnderlyingToken() external view returns (address)',
];

// Addresses
const SB_MACRO_ADDRESS = "0x383329703f346d72F4b86111a502daaa8f2c69C7";
const TOREX_ADDRESS = "0xA8E5F011F72088E3113E2f4F8C3FB119Fc2E226C";

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const account = useActiveAccount();

  const [inTokenAddress, setInTokenAddress] = useState<string | null>("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
  const [underlyingTokenAddress, setUnderlyingTokenAddress] = useState<string | null>(null);
  const [isTorexValid, setIsTorexValid] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<string>('');
  const [tokenAllowance, setTokenAllowance] = useState<string>('');

  // Create contract instances at the component level
  const torexContract = getContract({
    client: client,
    address: TOREX_ADDRESS,
    chain : chain,
  });

  // Use hooks at the component level
  const { data: pairedTokens, isLoading: isPairedTokensLoading, error : pairedTokensError } = useReadContract({
    contract: torexContract,
    method: "function getPairedTokens() external view returns (address inToken, address outToken)",
    queryOptions: {
      enabled: !!torexContract && !!account
    }
  });

  // Create superToken contract instance
  const superTokenContract = getContract({
    client: client,
    address: inTokenAddress,
    chain: chain,
  });

  // Use hooks for superToken data
  const { data: underlyingAddr, isLoading: isUnderlyingLoading, error: underlyingError } =  useReadContract({
    contract: superTokenContract,
    method: "function getUnderlyingToken() external view returns (address)",
    queryOptions: {
      enabled: !!superTokenContract && !!inTokenAddress
    }
  });

  // Log contract creation
  useEffect(() => {
    if (inTokenAddress) {
      //console.log('inTokenAddress', inTokenAddress);
      //console.log('superTokenContract', superTokenContract);
    }
  }, [inTokenAddress, superTokenContract]);

  // Effect to handle paired tokens data
  useEffect(() => {
    if (!isPairedTokensLoading && pairedTokens) {
      const [inTokenAddr, outTokenAddr] = pairedTokens;
      setInTokenAddress(inTokenAddr);
      //console.log('inTokenAddr', inTokenAddr);
      //console.log('outTokenAddr', outTokenAddr);
    }
  }, [pairedTokens, isPairedTokensLoading]);

  // Effect to handle underlying token data
  useEffect(() => {
    if (!isUnderlyingLoading && underlyingAddr) {
      setUnderlyingTokenAddress(underlyingAddr);
      //console.log('underlyingAddr', underlyingAddr);
      setIsTorexValid(true);
    }
  }, [underlyingAddr, isUnderlyingLoading]);

  const validateTorexAndFetchTokenInfo = async (torexAddr: string, address: string) => {
    try {
      console.log("underlyingAddr", underlyingAddr, "isTorexValid", isTorexValid);
      if (!underlyingAddr || underlyingAddr === "") {
        return { balance: '', allowance: '' };
      }

      // ERC20 token contract
      const erc20Contract = getContract({
        client: client,
        address: underlyingAddr,
        chain: chain
      });
      console.log("erc20Contract", erc20Contract);

      // Read ERC20 token data using Promise.all for parallel execution
      const balance = await getBalance({ contract: erc20Contract, address: account.address });
      const decimals = await getDecimals({ contract: erc20Contract });
      const allowance = await getAllowance({ contract: erc20Contract, owner: account.address, spender: SB_MACRO_ADDRESS });

      console.log("balance", balance);
      console.log("decimals", decimals);
      console.log("allowance", allowance);

      if (balance && decimals) {
        const formattedBalance = toTokens(balance.value, decimals);
        setTokenBalance(formattedBalance);
        console.log("formattedBalance", formattedBalance);

        const formattedAllowance = toTokens(allowance, decimals);
        setTokenAllowance(formattedAllowance);
        console.log("formattedAllowance", formattedAllowance);

        return { balance: formattedBalance, allowance: formattedAllowance };
     }

      throw new Error("Failed to fetch token information");
    } catch (error) {
      console.error("Error validating Torex address:", error);
      setIsTorexValid(false);
      return { balance: '', allowance: '' };
    }
  };

  useEffect(() => {
    if (account && isTorexValid) {
      validateTorexAndFetchTokenInfo(TOREX_ADDRESS, account.address);
    }
  }, [account, isTorexValid]);

  return (
    <TokenContext.Provider value={{
      validateTorexAndFetchTokenInfo,
      inTokenAddress,
      underlyingTokenAddress,
      tokenBalance,
      tokenAllowance
    }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = () => useContext(TokenContext);