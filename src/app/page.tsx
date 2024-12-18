'use client';
import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { TokenProvider, useTokenContext } from "@/components/contexts/TokenContext";
import { PositionProvider, usePosition } from "@/components/contexts/PositionContext";

export default function Home() {
  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        <div className="flex justify-center mb-20">
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Example App",
              url: "https://example.com",
            }}
          />
        </div>

        <TokenProvider>
          <PositionProvider>
            <TokenData />
          </PositionProvider>
        </TokenProvider>
      </div>
    </main>
  );
}

function TokenData() {

    // Ensure tokenContext is not null before destructuring
    const { inTokenAddress, underlyingTokenAddress, tokenBalance, tokenAllowance } = useTokenContext();
    const { positionData, loading, error, refetchWithDelay } = usePosition();

    console.log("positionData:", positionData);
    console.log("loading:", loading);
    console.log("error:", error);
   //console.log("refetchWithDelay:", refetchWithDelay);

  return (
    <div>
      {/* {data.pools.map((pool: any) => (
        <div key={pool.id} className="mb-4">
          <h3>Pool: {pool.id}</h3>
          {pool.poolMembers.map((member: any) => (
            <div key={member.id} className="ml-4">
              <p>Member: {member.id}</p>
              <p>Units: {member.units}</p>
              <p>Connected: {member.isConnected ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      ))} */}
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={thirdwebIcon}
        priority
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        thirdweb SDK
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        <span className="inline-block -skew-x-6 text-blue-500"> Next.js </span>
      </h1>

      <p className="text-zinc-300 text-base">
        Read the{" "}
        <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
          README.md
        </code>{" "}
        file to get started.
      </p>
    </header>
  );
}
