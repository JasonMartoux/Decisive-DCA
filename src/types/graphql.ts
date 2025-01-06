export interface Token {
  name: string;
  symbol: string;
  decimals: number;
}

export interface Outflow {
  currentFlowRate: bigint;
  createdAtTimestamp: string;
  updatedAtTimestamp: string;
  deposit: bigint;
  token: {
    name: string;
    decimals: number;
  };
}

export interface Pool {
  totalAmountDistributedUntilUpdatedAt: bigint;
}

export interface PoolMembership {
  id: string;
  totalAmountClaimed: bigint;
  units: bigint;
  pool: Pool;
}

export interface Account {
  outflows: Outflow[];
  poolMemberships: PoolMembership[];
}

export interface PoolMember {
  id: string;
  totalAmountReceivedUntilUpdatedAt: bigint;
  syncedPerUnitFlowRate: bigint;
  syncedPerUnitSettledValue: bigint;
  poolTotalAmountDistributedUntilUpdatedAt: bigint;
  account: Account;
}

export interface PoolData {
  token: Token;
  poolMembers: PoolMember[];
}

export interface GetPoolQuery {
  pools: PoolData[];
}

export interface GetPoolQueryVariables {
  poolAdmin: string;
  account: string;
}
