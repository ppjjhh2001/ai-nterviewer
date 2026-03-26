import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// HTML에서 id가 'root'인 요소를 찾아서 그 안에 React(App.tsx)를 그려줍니다.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);