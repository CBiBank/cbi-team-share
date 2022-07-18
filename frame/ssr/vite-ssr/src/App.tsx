import logo from './logo.svg'
import './App.css'

import { HelmetProvider, Helmet } from 'react-helmet-async';

export interface AppProps {
  data: any;
}

function App(props: AppProps) {
  const { data } = props;
  // @ts-ignore
  return (
    <div className="App">
      <HelmetProvider>
        <Helmet>
          <title>{data.user}</title>
        </Helmet>
      </HelmetProvider>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
