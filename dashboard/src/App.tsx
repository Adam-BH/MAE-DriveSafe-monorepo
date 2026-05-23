import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getToken } from './lib/auth';
import Login from './pages/Login';
import Portfolio from './pages/Portfolio';
import DriverDetail from './pages/DriverDetail';
import Claims from './pages/Claims';
import Alerts from './pages/Alerts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Portfolio /></RequireAuth>} />
          <Route path="/drivers/:id" element={<RequireAuth><DriverDetail /></RequireAuth>} />
          <Route path="/claims" element={<RequireAuth><Claims /></RequireAuth>} />
          <Route path="/alerts" element={<RequireAuth><Alerts /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
