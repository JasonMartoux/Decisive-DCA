import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { useEffect, useState } from "react";
import { getContract, toEther, toTokens } from "thirdweb";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { useActiveWallet } from "thirdweb/react";
import { EIP1193 } from "thirdweb/wallets";

export function NetBalance({ liveAddress }: { liveAddress: string }): JSX.Element {
  const [poolBalances, setPoolBalances] = useState<{[key: string]: string}>({});
  const [blockchainBalance, setBlockchainBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState(null);
  const wallet = useActiveWallet();

  useEffect(() => {
    if (wallet) {
      const provider = ethers6Adapter.provider.toEthers({
        client,
        chain,
      });

      setProvider(provider);
    }
  }, [wallet]);

  async function fetchSubgraphBalance() {
    setLoading(true);
    setError("");
    const endpoint = "https://subgraph-endpoints.superfluid.dev/base-mainnet/protocol-v1";

    const currentTimestamp = (await provider.getBlock("latest")).timestamp;

    const inflowQuery = {
      query: `query allReceivedStreams($receiver: String) {
        cfaStreams: streams(where: {receiver: $receiver}) {
          currentFlowRate
          streamedUntilUpdatedAt
          updatedAtTimestamp
          token {
            symbol
            name
          }
        }
        gdaStreams: poolMembers(where: {account: $receiver}) {
          pool {
            totalUnits
            flowRate
            totalAmountDistributedUntilUpdatedAt
            updatedAtTimestamp
            token {
              symbol
              name
            }
          }
          units
          totalAmountReceivedUntilUpdatedAt
          poolTotalAmountDistributedUntilUpdatedAt
          updatedAtTimestamp
        }
      }`,
      variables: { receiver: liveAddress },
    };

    const outflowQuery = {
      query: `query allSentStreams($sender: String) {
        cfaStreams: streams(where: {sender: $sender}) {
          currentFlowRate
          streamedUntilUpdatedAt
          updatedAtTimestamp
          token {
            symbol
            name
          }
        }
        gdaStreams: poolDistributors(where: {account: $sender}) {
          flowRate
          updatedAtTimestamp
          totalAmountDistributedUntilUpdatedAt
          pool {
            token {
              symbol
              name
            }
          }
        }
      }`,
      variables: { sender: liveAddress },
    };

    try {
      const inflowResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query: inflowQuery.query,
          variables: {
            receiver: liveAddress.toLowerCase()
          }
        })
      });

      const outflowResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query: outflowQuery.query,
          variables: {
            sender: liveAddress.toLowerCase()
          }
        })
      });

      const inflowData = await inflowResponse.json();
      const outflowData = await outflowResponse.json();
      
      console.log("Inflow Query Response:", inflowData);
      console.log("Outflow Query Response:", outflowData);
      console.log("Address used:", liveAddress.toLowerCase());

      // Initialize balances object to store per-pool balances
      const balances: { [key: string]: bigint } = {};

      // Calculate inflow balances per pool
      inflowData.data.cfaStreams.forEach((stream: any) => {
        const tokenSymbol = stream.token.symbol;
        const balance = BigInt(stream.currentFlowRate) *
          BigInt(currentTimestamp - parseInt(stream.updatedAtTimestamp)) +
          BigInt(stream.streamedUntilUpdatedAt);
        
        balances[tokenSymbol] = (balances[tokenSymbol] || BigInt(0)) + balance;
      });

      inflowData.data.gdaStreams.forEach((pool: any) => {
        const tokenSymbol = pool.pool.token.symbol;
        const balance = (BigInt(pool.units) * BigInt(pool.pool.flowRate) *
          BigInt(currentTimestamp - parseInt(pool.updatedAtTimestamp))) /
          BigInt(pool.pool.totalUnits) +
          BigInt(pool.totalAmountReceivedUntilUpdatedAt);
        
        balances[tokenSymbol] = (balances[tokenSymbol] || BigInt(0)) + balance;
      });

      // Calculate outflow balances per pool
      outflowData.data.cfaStreams.forEach((stream: any) => {
        const tokenSymbol = stream.token.symbol;
        const balance = BigInt(stream.currentFlowRate) *
          BigInt(currentTimestamp - parseInt(stream.updatedAtTimestamp)) +
          BigInt(stream.streamedUntilUpdatedAt);
        
        balances[tokenSymbol] = (balances[tokenSymbol] || BigInt(0)) - balance;
      });

      outflowData.data.gdaStreams.forEach((pool: any) => {
        const tokenSymbol = pool.token.symbol;
        const balance = BigInt(pool.flowRate) *
          BigInt(currentTimestamp - parseInt(pool.updatedAtTimestamp)) -
          BigInt(pool.totalAmountDistributedUntilUpdatedAt);
        
        balances[tokenSymbol] = (balances[tokenSymbol] || BigInt(0)) - balance;
      });

      // Convert all balances to Ether representation
      const formattedBalances: { [key: string]: string } = {};
      for (const [token, balance] of Object.entries(balances)) {
        formattedBalances[token] = toEther(balance);
      }

      setPoolBalances(formattedBalances);
    } catch (error) {
      console.error("Error calculating pool balances:", error);
      setError("Failed to calculate pool balances.");
    } finally {
      setLoading(false);
    }
  }

  const fetchBlockchainBalance = async () => {
    setLoading(true);
    setError("");
    try {
      
      const contractAddress = "0xD04383398dD2426297da660F9CCA3d439AF9ce1b"; //fake DAIx contract address on Mumbai
      const contractABI = [
        "function transferFrom(address from, address to, uint value)",
        "function balanceOf(address owner) view returns (uint balance)",
      ];

      const contractThirdWeb = getContract({
        client: client,
        chain: chain,
        address: contractAddress,
      });

      const ethersContract = await ethers6Adapter.contract.toEthers({thirdwebContract: contractThirdWeb})
      

      // const contract = new ethers.Contract(
      //   contractAddress,
      //   contractABI,
      //   provider
      // );
  
      const userAddress = liveAddress;
      const balance = await ethersContract.balanceOf(userAddress);
      console.log("balance", balance);
      setBlockchainBalance(toEther(BigInt(balance)));
    } catch (error) {
      console.error("Error fetching blockchain balance:", error);
      setError("Failed to fetch blockchain balance.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFetch = async () => {
    await fetchSubgraphBalance();
    await fetchBlockchainBalance();
  };
  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <h1>Pool Balances</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <p>
          Real-time balances for each pool from the subgraph
        </p>
      </div>
      <button
        onClick={handleFetch}
        disabled={loading}
        style={{
          padding: "10px",
          fontSize: "16px",
          margin: "10px 0",
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          outline: "none",
        }}
      >
        {loading ? "Loading..." : "Fetch Balances"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <div style={{ marginTop: "20px" }}>
        {Object.entries(poolBalances).map(([token, balance]) => (
          <div key={token} style={{ margin: "10px 0", padding: "10px", border: "1px solid #eee", borderRadius: "5px" }}>
            <p><strong>{token}</strong>: {balance}</p>
          </div>
        ))}
      </div>

      {blockchainBalance !== null && (
        <div style={{ marginTop: "20px" }}>
          <h2>Blockchain Balance</h2>
          <p>{blockchainBalance} USDCx</p>
        </div>
      )}
    </div>
  );
}