import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AuthProvider } from './auth/AuthProvider.tsx';
import App from './App.tsx';

//<RouterProvider router={router} />
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App/>
    </AuthProvider>
  </StrictMode>,
)
