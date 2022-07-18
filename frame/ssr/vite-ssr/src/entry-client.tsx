import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { fetchData } from './entry-server';

// @ts-ignore
const data = window.__SSR_DATA__ ?? fetchData();

const container: HTMLElement = document.getElementById('root')!

hydrateRoot(
  container,
  <React.StrictMode>
    <App data={data} />
  </React.StrictMode>
)
