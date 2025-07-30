import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PanelAdminPage from './pages/PanelAdminPage';
import LoginPage from './pages/LoginPage';
import OrganizerPanelPage from './pages/OrganizerPanelPage';
import EventPublicPage from './pages/EventPublicPage';
import EventStatsPage from './pages/EventStatsPage';
import ClientPanelPage from './pages/ClientPanelPage';
import RegisterPage from './pages/RegisterPage';
import SuccessPage from './pages/SuccessPage';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LogoutPage from './pages/LogoutPage';
import CartPage from './pages/CartPage';
import OrganizerEventsPage from './pages/OrganizerEventsPage';
import OrganizerTicketsPage from './pages/OrganizerTicketsPage';
import OrganizerStatsPage from './pages/OrganizerStatsPage';
import UsersPage from './pages/UsersPage';
import OrganizersPage from './pages/OrganizersPage';
import EventsPage from './pages/EventsPage';
import TicketsPage from './pages/TicketsPage';
import CreditsPage from './pages/CreditsPage';
import DashboardWidgets from './components/DashboardWidgets';
import { Outlet } from 'react-router-dom';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './components/AdminDashboard';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && !role.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'superadmin') return <Navigate to="/" />;
  if (user.role === 'organizer') return <Navigate to="/organizer-panel" />;
  return <Navigate to="/client-panel" />;
}

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
          },
          success: {
            iconTheme: {
              primary: '#28a745',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc3545',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/event/:organizerSubdomain/:eventId" element={<EventPublicPage />} />
          <Route path="/event/:organizerSubdomain/:eventId/stats" element={<EventStatsPage />} />
          <Route path="/success" element={<SuccessPage />} />
          
          {/* Protected Admin Routes with Layout */}
          <Route path="/" element={
            <PrivateRoute role={["superadmin"]}>
              <PanelAdminPage />
            </PrivateRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="organizers" element={<OrganizersPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="credits" element={<CreditsPage />} />
          </Route>
          
          <Route path="/redirect" element={<RoleRedirect />} />
          
          <Route path="/organizer-panel" element={
              <PrivateRoute role={["organizer"]}>
                <OrganizerPanelPage />
              </PrivateRoute>
            }
          >
            <Route index element={<OrganizerDashboard />} />
            <Route path="events" element={<OrganizerEventsPage />} />
            <Route path="tickets" element={<OrganizerTicketsPage />} />
            <Route path="stats" element={<OrganizerStatsPage />} />
          </Route>
          
          <Route path="/client-panel" element={
            <PrivateRoute role={["client", "organizer", "superadmin"]}>
              <ClientPanelPage />
            </PrivateRoute>
          } />
          <Route path="/client-panel/*" element={<Navigate to="/client-panel" />} />
          
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/cart" element={<CartPage />} />
          
        </Routes>
      </Router>
    </>
  );
}

export default App;
