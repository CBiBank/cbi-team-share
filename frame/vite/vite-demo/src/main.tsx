import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import 'virtual:windi.css';
import 'virtual:svg-icons-register';

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// 18版本为createRoot，跟vue差不多
/**
  import { createRoot } from 'react-dom/client';
  const container = document.getElementById('app');
  const root = createRoot(container); // createRoot(container!) if you use TypeScript
  root.render(<App tab="home" />);
*/
