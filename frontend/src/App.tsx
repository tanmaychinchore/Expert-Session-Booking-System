import { useState } from 'react';
import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ExpertList from './pages/ExpertList';
import ExpertDetail from './pages/ExpertDetail';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-panel">
          <strong>Expertly</strong>
          <p>Expert session booking</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-link">Experts</Link>
          <Link to="/bookings" className="sidebar-link">My bookings</Link>
        </nav>
        <div className="sidebar-footer">
          {user ? (
            <div>
              <p>Welcome, {user.name}</p>
              <button onClick={logout} className="button button-ghost" style={{ width: '100%', marginTop: '8px' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/login" className="sidebar-link" style={{ textAlign: 'center' }}>Login</Link>
              <Link to="/register" className="sidebar-link" style={{ textAlign: 'center' }}>Register</Link>
            </div>
          )}
          <p style={{ marginTop: '16px' }}>Real-time booking updates</p>
        </div>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <div>
            <h1>Expert Session Booking</h1>
            <p>Browse experts, select a slot, and confirm bookings in real time.</p>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ExpertList
                    search={search}
                    category={category}
                    onSearchChange={setSearch}
                    onCategoryChange={setCategory}
                  />
                </ProtectedRoute>
              }
            />
            <Route path="/experts/:id" element={<ProtectedRoute><ExpertDetail /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
