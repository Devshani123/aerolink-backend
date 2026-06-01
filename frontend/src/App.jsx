import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Flights from './pages/Flights';
import Bookings from './pages/Bookings';
import Baggage from './pages/Baggage';
import Navbar from './components/Navbar';

// Protect pages that need login
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes - need token */}
                <Route path="/dashboard" element={
                    <ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>
                } />
                <Route path="/flights" element={
                    <ProtectedRoute><Navbar /><Flights /></ProtectedRoute>
                } />
                <Route path="/bookings" element={
                    <ProtectedRoute><Navbar /><Bookings /></ProtectedRoute>
                } />
                <Route path="/baggage" element={
                    <ProtectedRoute><Navbar /><Baggage /></ProtectedRoute>
                } />

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;