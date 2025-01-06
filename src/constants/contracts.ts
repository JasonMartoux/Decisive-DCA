import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { base } from "thirdweb/chains";

export const MACRO_FORWARDER_ADDRESS ="0xfD01285b9435bc45C243E5e7F978E288B2912de6";
export const SB_MACRO_ADDRESS = "0xE581E09a9c2a9188c3E6F0fAb5a0b3EC88cA39aE";
export const TOREX_USDC_ETH_ADDRESS = "0xA8E5F011F72088E3113E2f4F8C3FB119Fc2E226C";
export const USDC_TOKEN_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const CFA_FORWARDER_ADDRESS ="0xcfA132E353cB4E398080B9700609bb008eceB125";
export const GDA_FORWARDER_ADDRESS ="0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08";
export const DEFAULT_EXAMPLE_USER_ADDRESS = "0x2C9139D5eC9206Bd779A71ecdB927C8cD42E9639";

export const macroForwarderContract = getContract({
  client: client,
  chain: base,
  address: MACRO_FORWARDER_ADDRESS,
});

export const sbMacroContract = getContract({
  client: client,
  chain: base,
  address: SB_MACRO_ADDRESS,
});

export const cfaForwarderContract = getContract({
  client: client,
  chain: base,
  address: CFA_FORWARDER_ADDRESS,
});

export const gdaForwarderContract = getContract({
  client: client,
  chain: base,
  address: GDA_FORWARDER_ADDRESS,
});

export const torexContract = getContract({
  client: client,
  chain: base,
  address: TOREX_USDC_ETH_ADDRESS,
  abi: [
    {
      type: "function",
      name: "getFlowInfo",
      inputs: [],
      outputs: [
        {
          type: "address",
          name: "inToken",
        },
        {
          type: "address",
          name: "outToken",
        },
      ],
      stateMutability: "view",
    },
  ],
});

