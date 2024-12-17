'use client';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { useState } from 'react';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    new ApolloClient({
      uri: 'https://subgraph-endpoints.superfluid.dev/base-mainnet/protocol-v1',
      cache: new InMemoryCache(),
    })
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}