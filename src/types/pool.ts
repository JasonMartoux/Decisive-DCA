// Define the shape of a stream
interface PoolMember {
  token: {
    name: string;
    symbol: string;
    decimals: string;
  };
  account: {
    outflows: {
      deposit: string;
      currentFlowRate: string;
      createdAtTimestamp: string;
    }[];
    poolMemberships: {
      totalAmountClaimed: string;
      pool: {
        perUnitSettledValue: string;
      };
    }[];
  };
}

// Define the shape of the position data
interface PositionData {
  pools: {
    id: string;
    poolMembers: PoolMember[];
  }[];
}

// Define the shape of the context value
interface PositionContextValue {
  positionData: PositionData | null;
  loading: boolean;
  error: any;
  refetchWithDelay: (delayMs: number) => void;
}
