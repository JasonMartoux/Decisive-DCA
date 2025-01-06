import { gql } from '@apollo/client';

export const GET_POOL = gql`
query getPool($poolAdmin: String!, $account: String!) {
  pools(where: {admin_contains: $poolAdmin}) {
    token {
      name
      symbol
      decimals
    }
    poolMembers(where: {account_contains: $account}) {
      id
      totalAmountReceivedUntilUpdatedAt
      syncedPerUnitFlowRate
      syncedPerUnitSettledValue
      poolTotalAmountDistributedUntilUpdatedAt
      account {
        outflows {
          currentFlowRate
          createdAtTimestamp
          updatedAtTimestamp
          deposit
          token {
            name
            decimals
          }
        }
        poolMemberships {
          id
          totalAmountClaimed
          units
          pool {
            totalAmountDistributedUntilUpdatedAt
          }
        }
      }
    }
  }
}
`;
