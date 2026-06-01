import { Link, useNavigate } from 'react-router-dom';
import { getRole } from '../useRole';
import { Plane, LayoutDashboard, Calendar, Luggage, LogOut } from 'lucide-react';

function Navbar() {
    const navigate = useNavigate();
    const role = getRole();

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        navigate('/login');
    };

    const roleColors = {
        Admin: '#dc2626',
        Staff: '#d97706',
        Passenger: '#16a34a',
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.left}>
                <Plane size={24} color="#38bdf8" />
                <span style={styles.brand}>AeroLink</span>
            </div>
            <div style={styles.links}>
                <Link to="/dashboard" style={styles.link}>
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                </Link>
                <Link to="/flights" style={styles.link}>
                    <Plane size={16} />
                    <span>Flights</span>
                </Link>
                <Link to="/bookings" style={styles.link}>
                    <Calendar size={16} />
                    <span>My Bookings</span>
                </Link>
                <Link to="/baggage" style={styles.link}>
                    <Luggage size={16} />
                    <span>Baggage</span>
                </Link>
                <span style={{
                    ...styles.roleBadge,
                    background: roleColors[role] || '#64748b'
                }}>
                    {role}
                </span>
                <button onClick={logout} style={styles.logoutBtn}>
                    <LogOut size={15} />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        background: '#0f172a',
        padding: '0 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    brand: {
        color: '#f1f5f9',
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '-0.5px',
    },
    links: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    link: {
        color: '#94a3b8',
        textDecoration: 'none',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        borderRadius: '6px',
        transition: 'all 0.2s',
    },
    roleBadge: {
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        marginLeft: '8px',
    },
    logoutBtn: {
        background: 'transparent',
        color: '#94a3b8',
        border: '1px solid #334155',
        padding: '8px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
};

export default Navbar;