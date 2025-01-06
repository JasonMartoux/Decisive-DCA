"use client";

import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
//import StreamsDashboard from "@/components/StreamsDashboard";
import { Navbar } from "@/components/Navbar";
import { ApolloProvider } from "@apollo/client";
import clientApollo from "@/lib/apollo_client";
import PoolPositions from "@/components/PoolPositions";
import { TorexPoolInfos } from "@/components/TorexPoolInfos";

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container mx-auto mb-3 p-4">
          <Navbar />
          <div className="text-center mx-auto mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Automate Your DCA Strategy
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Set up automated token swaps with real-time streaming. Dollar-cost
              averaging made simple and efficient for better long-term results, thx to superboring and superfluid!
            </p>
          </div>

          <TorexPoolInfos />
          {/* <ApolloProvider client={clientApollo}>
            <PoolPositions />
          </ApolloProvider> */}

          {/* <StreamsDashboard /> */}
        </div>
      </div>
    </>
  );
}
