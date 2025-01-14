"use client";

import { chain } from "@/app/chain";
import { client } from "@/app/client";
import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { getContract, prepareContractCall, ThirdwebContract, toEther } from "thirdweb";
import { USDC_TOKEN_ADDRESS, cfaForwarderContract, torexContract } from "@/constants/contracts";
import { useEffect, useState } from "react";
import { Account } from "thirdweb/wallets";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import FlowingBalance from "./ui/FlowingBalance";
import { NetBalance } from "./NetBalance";
import { balanceOf } from "thirdweb/extensions/erc20";

export const TorexPoolInfos = () => {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: outTokenDistributionPoolAddress } = useReadContract({
    contract: torexContract,
    method: "function outTokenDistributionPool() view returns (address)",
    queryOptions: {
      enabled: !!account,
    },
  });

  const { data: torexPairedTokens } = useReadContract({
    contract: torexContract,
    method: "function getPairedTokens() view returns (address inToken, address outToken)",
    queryOptions: {
      enabled: !!account,
    },
  });

  const [outTokenDistributionPoolContract, setOutTokenDistributionPoolContract] = useState<ThirdwebContract | null>(null);
  const [totalAmountReceived, setTotalAmountReceived] = useState<string>('0');
  const [flowInfos, setFlowInfosOutToken] = useState<Array<string> | null>(null);
  const [deposit, setDeposit] = useState<string>('0');
  const [lastUpdated, setLastUpdated] = useState<string>('0');
  const [flowrate, setFlowrate] = useState<string>('0');
  const [torenxOutBalance, setTorexOutBalance] = useState<BigInt>('0');

  useEffect(() => {
    if (account && outTokenDistributionPoolAddress) {
      const outTokenDistributionPoolContract = getContract({
        client: client,
        chain: chain,
        address: outTokenDistributionPoolAddress,
        abi: [{
          type: 'function',
          name: 'getTotalAmountReceivedByMember',
          inputs: [{
            type: 'address',
            name: 'memberAddr'
          }],
          outputs: [{
            type: 'uint256',
            name: 'totalAmountReceived'
          }],
          stateMutability: 'view',
        }]
      });
      setOutTokenDistributionPoolContract(outTokenDistributionPoolContract);

      const fetchData = async () => {
        await fetchDistributionPoolData(outTokenDistributionPoolContract, account);
      };

      fetchData();
    }
  }, [outTokenDistributionPoolAddress, account]);

  const fetchDistributionPoolData = async (outTokenDistributionPoolContract: ThirdwebContract, account: Account) => {
    setIsLoading(true);
    setError(null);
    try {
      const ethersoutTokenDistributionPoolContract = await ethers6Adapter.contract.toEthers({ thirdwebContract: outTokenDistributionPoolContract })
      const ethersCfaForwarderContract = await ethers6Adapter.contract.toEthers({ thirdwebContract: cfaForwarderContract })
      const balanceOfOutToken = await balanceOf({contract:torexPairedTokens[0],address: account.address});
      console.log('balanceOfOutToken', balanceOfOutToken);
      const [totalAmountReceived, flowInfo] = await Promise.all([
        ethersoutTokenDistributionPoolContract.getTotalAmountReceivedByMember(account.address),
        ethersCfaForwarderContract.getFlowInfo(torexPairedTokens[0], account.address, torexContract.address)
      ]);

      const { lastUpdated: newLastUpdated, flowrate: newFlowrate, deposit: newDeposit, owedDeposit } = flowInfo;

      setTotalAmountReceived(totalAmountReceived.toString());
      setFlowInfosOutToken([newLastUpdated, newFlowrate, newDeposit, owedDeposit]);
      setDeposit(newDeposit);
      setLastUpdated(newLastUpdated);
      setFlowrate(newFlowrate);
      setTorexOutBalance(balanceOfOutToken);
    } catch (err) {
      console.error('Error fetching pool data:', err);
      setError('Failed to fetch pool data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="flex justify-between items-center">
        <ConnectButton
          client={client}
          chain={chain}
          detailsButton={{
            displayBalanceToken: {
              [chain.id]: USDC_TOKEN_ADDRESS,
            },
          }}
        />
      </div>
    );
  }

  // Calculate monthly flow rate using average month length (365/12 days)
  const SECONDS_PER_MONTH = (365/12) * 24 * 60 * 60;
  const monthlyFlowRate = flowrate ? 
    (Number(flowrate) * SECONDS_PER_MONTH).toString() : 
    '0';

  return (
    <div className="min-w-[500px] p-4">
      <div className="relative bg-gradient-to-br from-white to-[#f8f9fd] rounded-2xl p-6 shadow-lg border border-[#edf0f5]">
        {/* Header with token pair */}
        <div className="absolute -top-4 left-6 bg-[#2a85f0] text-white px-4 py-2 rounded-full shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-medium">USDC → cBTC</span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          {/* Left column - Flow details */}
          <div className="space-y-4">
            <div className="bg-[#f3f5fa] rounded-xl p-4">
              <p className="text-[#666] text-sm">Monthly Flow</p>
              <p className="text-[#222] text-xl font-bold mt-1">
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `${parseFloat(toEther(monthlyFlowRate))} USDC`
                )}
              </p>
            </div>
            <div className="bg-[#f3f5fa] rounded-xl p-4">
              <p className="text-[#666] text-sm">Total Streamed</p>
              <p className="text-[#222] text-xl font-bold mt-1">
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `${parseFloat(toEther(deposit))} USDC`
                )}
              </p>
              <div className="text-xs text-[#666] mt-1">
                Last updated: {new Date(parseInt(lastUpdated) * 1000).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Right column - Received and rewards */}
          <div className="space-y-4">
            <div className="bg-[#f3f5fa] rounded-xl p-4">
              <p className="text-[#666] text-sm">Total Received</p>
              <p className="text-[#222] text-xl font-bold mt-1">
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `${parseFloat(toEther(totalAmountReceived))} cBTC`
                )}
              </p>
            </div>
            <div className="bg-[#f3f5fa] rounded-xl p-4">
              <p className="text-[#666] text-sm">Flowing Balance</p>
              <p className="text-[#222] text-xl font-bold mt-1">
              <FlowingBalance 
                startingBalance={BigInt(deposit)} 
                startingBalanceDate={new Date(parseInt(lastUpdated) * 1000)} 
                flowRate={BigInt(flowrate)} 
              />
              </p>
                            <div className="text-xs text-[#666] mt-1">
                Last updated: {new Date(parseInt(lastUpdated) * 1000).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6">
        <NetBalance liveAddress={account.address} />
      </div>
    </div>
  );
};