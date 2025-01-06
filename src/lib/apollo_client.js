import { ApolloClient, InMemoryCache } from "@apollo/client";

const clientApollo = new ApolloClient({
  uri: "https://subgraph-endpoints.superfluid.dev/base-mainnet/protocol-v1",
  cache: new InMemoryCache(),
});

export default clientApollo;
