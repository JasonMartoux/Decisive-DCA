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


export const TorexPoolInfos = () => {
  const account = useActiveAccount();

    const { data: outTokenDistributionPoolAddress} = useReadContract({
        contract: torexContract,
        method: "function outTokenDistributionPool() view returns (address)",
        queryOptions: {
            enabled: !!account,
        },
    });
    const { data: torexPairedTokens} = useReadContract({
        contract: torexContract,
        method: "function getPairedTokens() view returns (address inToken, address outToken)",
        queryOptions: {
            enabled: !!account,
        },
    });

    const [outTokenDistributionPoolContract, setOutTokenDistributionPoolContract] = useState<ThirdwebContract | null>(null);
    const [totalAmountReceived, setTotalAmountReceived] = useState<string | null>(null);
    const [flowInfos, setFlowInfosOutToken] = useState<Array<string> | null>(null);
    const [deposit, setDeposit] = useState<string>('0');
    const [lastUpdated, setLastUpdated] = useState<string>('0');
    const [flowrate, setFlowrate] = useState<string>('0');

  useEffect(() => {
    if(account && outTokenDistributionPoolAddress) {
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
            // Call validateTorexAndFetchTokenInfo and set states within that function
            await fetchDistributionPoolData(outTokenDistributionPoolContract, account);
          };
    
          fetchData();
    }
  }, [outTokenDistributionPoolAddress, account]);

  const fetchDistributionPoolData = async (outTokenDistributionPoolContract: ThirdwebContract, account: Account) => {
   const ethersoutTokenDistributionPoolContract = await ethers6Adapter.contract.toEthers({thirdwebContract: outTokenDistributionPoolContract})
   const ethersCfaForwarderContract = await ethers6Adapter.contract.toEthers({thirdwebContract: cfaForwarderContract})
   const totalAmountReceived = await ethersoutTokenDistributionPoolContract.getTotalAmountReceivedByMember(account.address);
   const totalFlowRateSent = await ethersCfaForwarderContract.getFlowrate(torexPairedTokens[0], account.address, torexContract.address);
   const {lastUpdated: newLastUpdated, flowrate: newFlowrate, deposit: newDeposit, owedDeposit}  = await ethersCfaForwarderContract.getFlowInfo(torexPairedTokens[0], account.address, torexContract.address);

   console.log("flowInfos", [newLastUpdated, newFlowrate, newDeposit, owedDeposit]);
   console.log("torexPairedTokens", torexPairedTokens);
   setTotalAmountReceived(totalAmountReceived);
   setFlowInfosOutToken([newLastUpdated, newFlowrate, newDeposit, owedDeposit]);
   setDeposit(newDeposit);
   setLastUpdated(newLastUpdated);
   setFlowrate(newFlowrate);
    // const transaction = prepareContractCall({
    //     contract: outTokenDistributionPoolContract,
    //     method: "function getTotalAmountReceivedByMember(address memberAddr) external returns (uint256 totalAmountReceived)",
    //     params: [account.address],
    //   });

    //   console.log(transaction);
  };


  if (!account) {
    return (
      <div className="flex justify-between items-center ">
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


//   const { data: depositAmount } = useReadContract({
//     contract: contract,
//     method: "getDeposit",
//   });

//   const { data: taskCount } = useReadContract({
//     contract: contract,
//     method: "getTasksCount",
//   });

//   const { data: lockedFundsAmount, isLoading: isLoadingLockedFundsAmount } =
//     useReadContract({
//       contract: contract,
//       method: "getDeposit",
//     });


    return (
      <div style={{ textAlign: "center", minWidth: "500px" }}>
        {
         <> 
          <FlowingBalance startingBalance={BigInt(deposit)} startingBalanceDate={new Date(parseInt(lastUpdated) * 1000)} flowRate={BigInt(flowrate)} />
          <NetBalance liveAddress={account.address} />
         </>
        }
      </div>
    );

};