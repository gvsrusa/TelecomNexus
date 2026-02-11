'use client';

import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from '@apollo/client';
import { useMemo, type ReactNode } from 'react';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:4000/graphql';

function makeClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: GATEWAY_URL }),
    cache: new InMemoryCache({
      typePolicies: {
        Customer: { keyFields: ['customerId'] },
        Plan: { keyFields: ['planCode'] },
        NetworkDevice: { keyFields: ['deviceId'] },
      },
    }),
  });
}

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = useMemo(() => makeClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
