import { MockedResponse } from '@apollo/react-testing';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { DocumentNode, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import Constants from 'expo-constants';

import typeDefs from './schema';

const { manifest } = Constants

const httpUri = `http://${manifest.debuggerHost.split(':').shift()}:4000`
const wsUri = `ws://${manifest.debuggerHost.split(':').shift()}:4000/graphql`

export interface ApolloMock<R, I> extends MockedResponse {
  request: {
    query: DocumentNode
    variables?: I
    operationName?: string
    context?: Record<string, any>
    extensions?: Record<string, any>
  }
  result?: { data: R }
}

const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    reconnect: true,
  },
})

const httpLink = new HttpLink({ uri: httpUri })

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)

    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  httpLink,
)

const cache = new InMemoryCache({ addTypename: true })

cache.writeData({
  data: {
    seenSongs: [],
  },
})

export const client = new ApolloClient({
  link,
  cache,
  typeDefs,
})
