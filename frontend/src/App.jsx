import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import CustomerSearch from './pages/CustomerSearch';
import CustomerDashboard from './pages/CustomerDashboard';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Pages */}
                <Route path="/tracking" element={<CustomerSearch />} />
                <Route path="/order/:ticketNumber" element={<CustomerDashboard />} />

                {/* Admin Login */}
                <Route path="/login" element={<Login />} />

                {/* Admin Pages (Protected) */}
                <Route path="/admin" element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="new-order" element={<NewOrder />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="reports" element={<Reports />} />
                </Route>

                <Route path="/" element={<Navigate to="/tracking" />} />
            </Routes>
        </Router>
    );
}

export default App;


