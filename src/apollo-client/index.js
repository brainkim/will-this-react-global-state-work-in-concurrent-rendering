import React from 'react';
import {
  ApolloLink,
  ApolloClient,
  gql,
  InMemoryCache,
  ApolloProvider,
  useQuery,
} from '@apollo/client';

import {
  reducer,
  initialState,
  selectCount,
  incrementAction,
  doubleAction,
  createApp,
} from '../common';

const COUNT_QUERY = gql`
  query {
    count
    dummy
  }
`;

const cache = new InMemoryCache();
cache.writeQuery({
  query: COUNT_QUERY,
  data: initialState,
});

const client = new ApolloClient({
  cache,
  link: ApolloLink.empty(),
});

function useCount() {
  const { loading, error, data } = useQuery(COUNT_QUERY);
  if (loading) {
    throw new Error('Cache miss');
  } else if (error) {
    throw error;
  }

  return selectCount(data);
}

function useIncrement() {
  return () => {
    const data = cache.readQuery({ query: COUNT_QUERY });
    cache.writeQuery({
      query: COUNT_QUERY,
      data: reducer(data, incrementAction),
    });
  };
}

function useDouble() {
  return () => {
    const data = cache.readQuery({ query: COUNT_QUERY });
    cache.writeQuery({
      query: COUNT_QUERY,
      data: reducer(data, doubleAction),
    });
  };
}

const Root = ({ children }) => (
  <ApolloProvider client={client}>
    {children}
  </ApolloProvider>
);

export default createApp(useCount, useIncrement, useDouble, Root);
