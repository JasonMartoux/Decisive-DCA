import { client } from "@/app/client";
import { DEFAULT_EXAMPLE_USER_ADDRESS, TOREX_USDC_ETH_ADDRESS, USDC_TOKEN_ADDRESS } from "@/constants/contracts";
import { base } from "thirdweb/chains";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { useQuery } from "@apollo/client";
import { GET_POOL } from "@/utils/queries";
import type { GetPoolQuery, GetPoolQueryVariables } from "@/types/graphql";
import { toTokens } from "thirdweb";
import FlowingBalance from "./ui/FlowingBalance";

export default function PoolPositions() {
  const account = useActiveAccount();

  const { loading, error, data } = useQuery<GetPoolQuery, GetPoolQueryVariables>(
    GET_POOL,
    {
      variables: {
        poolAdmin: TOREX_USDC_ETH_ADDRESS.toLowerCase(),
        account: DEFAULT_EXAMPLE_USER_ADDRESS.toLowerCase() || ""
      },
      skip: !account
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!account) {
    return (
      <div className="flex justify-between items-center ">
        <ConnectButton
          client={client}
          chain={base}
          detailsButton={{
            displayBalanceToken: {
              [base.id]: USDC_TOKEN_ADDRESS,
            },
          }}
        />
      </div>
    );
  }

  const calculateMonthlyFlowRate = (flowRate: bigint) => {
    const secondsInMonth = BigInt(30 * 24 * 60 * 60);
    const monthlyFlowRateWei = BigInt(flowRate) * secondsInMonth;
    return parseFloat(toTokens(monthlyFlowRateWei, 18)).toFixed(4);
  };

  return (
    <div className="space-y-6">
      {data?.pools.map((pool, index) => (
        <div key={index} className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">{pool.token.name} ({pool.token.symbol})</h2>

          {pool.poolMembers.map((member) => (
            <div key={member.id} className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-2">Pool Member Details</h3>
                <p className="mb-2">Amount Received: {toTokens(member.totalAmountReceivedUntilUpdatedAt, pool.token.decimals)} {pool.token.symbol}</p>
                <p className="mb-2">Flow Rate: {calculateMonthlyFlowRate(member.syncedPerUnitFlowRate)} {pool.token.symbol}/month</p>
                {/* <p className="mb-2">Flow Rate: <FlowingBalance startingBalance={member.totalAmountReceivedUntilUpdatedAt} startingBalanceDate={new Date()} flowRate={member.syncedPerUnitFlowRate} /></p> */}
                <p className="mb-2">Settled Value: {toTokens(member.syncedPerUnitSettledValue, pool.token.decimals)} {pool.token.symbol}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">Outflows</h3>
                <div className="space-y-3">
                  {member.account.outflows.map((outflow, outflowIndex) => (
                    <div key={outflowIndex} className="p-3 bg-gray-50 rounded">
                      <p className="mb-1">Token: {outflow.token.name}</p>
                      <p className="mb-1">Flow Rate: {calculateMonthlyFlowRate(outflow.currentFlowRate)} {outflow.token.name}/month</p>
                      <p className="mb-1">Total Amount Streamed: <FlowingBalance startingBalance={BigInt(outflow.deposit)} startingBalanceDate={new Date(parseInt(outflow.createdAtTimestamp) *1000)} flowRate={BigInt(outflow.currentFlowRate)} /></p>
                      {/* <p className="mb-1">Deposit: {toTokens(outflow.deposit, outflow.token.decimals)} {outflow.token.name}</p> */}
                      <p className="text-sm text-gray-500">Created: {new Date(parseInt(outflow.createdAtTimestamp) * 1000).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Updated: {new Date(parseInt(outflow.updatedAtTimestamp) * 1000).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
