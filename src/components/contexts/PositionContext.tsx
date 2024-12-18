import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { gql, useQuery } from "@apollo/client";
import { useActiveAccount } from "thirdweb/react";

// Define the shape of a stream
interface PoolMember {
  id: string;
  units: string;
  isConnected: boolean;
  totalAmountClaimed: string;
  totalAmountReceivedUntilUpdatedAt: string;
  poolTotalAmountDistributedUntilUpdatedAt: string;
  updatedAtTimestamp: string;
  updatedAtBlockNumber: string;
  syncedPerUnitSettledValue: string;
  syncedPerUnitFlowRate: string;
  account: {
    id: string;
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

// Create the context
const PositionContext = createContext<PositionContextValue | undefined>(
  undefined
);

// Define the GraphQL query
const POOLS_QUERY = gql`
  query getFlowEvents($poolAdmin: String!, $account: String!) {
    pools(where: { admin_contains: $poolAdmin }) {
      id
      poolMembers(where: { account_contains: $account }) {
        id
        units
        isConnected
        totalAmountClaimed
        totalAmountReceivedUntilUpdatedAt
        poolTotalAmountDistributedUntilUpdatedAt
        updatedAtTimestamp
        updatedAtBlockNumber
        syncedPerUnitSettledValue
        syncedPerUnitFlowRate
        account {
          id
          outflows {
            deposit
            currentFlowRate
            createdAtTimestamp
          }
          poolMemberships {
            totalAmountClaimed
            pool {
              perUnitSettledValue
            }
          }
        }
      }
    }
  }
`;

// Composant Provider
export const PositionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const address = "0x2C9139D5eC9206Bd779A71ecdB927C8cD42E9639"; //useActiveAccount(); // Adresse active
  const poolAdmin = "0xA8E5F011F72088E3113E2f4F8C3FB119Fc2E226C"; // Pool admin statique

  const [positionData, setPositionData] = useState<PositionData | null>(null);

  // Utilisation d'Apollo Client avec des variables dynamiques
  const { loading, error, data, refetch } = useQuery<PositionData>(
    POOLS_QUERY,
    {
      variables: {
        poolAdmin: poolAdmin.toString().toLowerCase(),
        account: address.toLowerCase(),
      },
      skip: !address, // Ignorer la requête si l'adresse est absente
    }
  );

  // Mise à jour explicite des données locales lorsque `data` change
  useEffect(() => {
    if (data && data.pools) {
      setPositionData({ pools: data.pools });
    }
  }, [data]);

  // Fonction pour refetch avec throttling
  const refetchWithDelay = useCallback(
    (delayMs: number) => {
      if (address) {
        setTimeout(() => {
          refetch({ poolAdmin, account: address });
        }, delayMs);
      }
    },
    [refetch, address, poolAdmin]
  );

  // Debugging amélioré
  useEffect(() => {
    console.log("Adresse active :", address);
    console.log("Position data mise à jour :", positionData);
  }, [address, positionData]);

  // Fournir les valeurs contextuelles
  const value: PositionContextValue = {
    positionData,
    loading,
    error,
    refetchWithDelay,
  };

  return (
    <PositionContext.Provider value={value}>
      {children}
    </PositionContext.Provider>
  );
};

// Create a custom hook to use the context
export const usePosition = (): PositionContextValue => {
  const context = useContext(PositionContext);
  if (context === undefined) {
    throw new Error("usePosition must be used within a PositionProvider");
  }
  return context;
};
