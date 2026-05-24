import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { AUTH_TOKEN } from './constants'
import { AuthProvider } from './auth'
import './styles/index.css'
import App from './components/App'

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000',
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <AuthProvider>
    <BrowserRouter>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </BrowserRouter>
  </AuthProvider>
)
