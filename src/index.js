import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Optional: Include your global styles
import App from './App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
