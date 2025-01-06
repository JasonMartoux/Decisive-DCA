"use client";

import { client } from "@/app/client";
import { USDC_TOKEN_ADDRESS } from "@/constants/contracts";
import { base } from "thirdweb/chains";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { ArrowDownUp, LayoutList } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="text-blue-500" size={24} />
            <span className="font-bold text-xl">
              Decisive a(utomatio)n DCA{" "}
            </span>
          </div>
          <div className="flex gap-6">
            <ConnectButton
              client={client}
              chain={base}
              // accountAbstraction={{
              //   chain: base,
              //   sponsorGas: true,
              // }}
              detailsButton={{
                displayBalanceToken: {
                  [base.id]: USDC_TOKEN_ADDRESS,
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
