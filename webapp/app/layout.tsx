'use client';
import { ReactNode } from 'react';

import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';

import { useApollo } from '@/graphql/apollo';
import theme from '@/theme';

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  const apolloClient = useApollo({});
  return (
    <html>
      <body>
        <ApolloProvider client={apolloClient}>
          <ChakraProvider resetCSS theme={theme}>
            {children}
          </ChakraProvider>
        </ApolloProvider>
      </body>
    </html>
  );
};

export default RootLayout;
