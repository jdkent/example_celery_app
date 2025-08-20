// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Holders from './pages/Holders';
import Checkout from './pages/Checkout';

const App: React.FC = () => (
  <Router>
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/holders" element={<Holders />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </AppShell>
  </Router>
);

export default App;
