/* src/App.jsx */
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import netlifyIdentity from 'netlify-identity-widget';
import Home from './pages/Home';
import Login from './pages/Login';
import Gestion from './pages/Gestion';

function PrivateRoute({ children, user }) {
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    netlifyIdentity.init();
    netlifyIdentity.on('login', u => {
      setUser(u);
      netlifyIdentity.close();
    });
    netlifyIdentity.on('logout', () => setUser(null));
    const current = netlifyIdentity.currentUser();
    if (current) setUser(current);
    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login netlifyIdentity={netlifyIdentity} />} />
        <Route
          path="/gestion"
          element={
            <PrivateRoute user={user}>
              <Gestion user={user} />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
