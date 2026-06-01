import { Link } from 'react-router-dom';
import { getRole, getEmail } from '../useRole';
import { Plane, Calendar, Luggage, Settings, ChevronRight } from 'lucide-react';

function Dashboard() {
    const email = getEmail();
    const role = getRole();

    const roleColors = {
        Admin: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
        Staff: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
        Passenger: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    };

    const rc = roleColors[role] || roleColors.Passenger;

    const cards = [
        {
            icon: <Plane size={22} color="#0284c7" />,
            bg: '#eff6ff',
            title: 'Search Flights',
            desc: 'Browse available flights and check real-time seat availability',
            link: '/flights',
            label: 'View Flights',
            show: true,
        },
        {
            icon: <Calendar size={22} color="#7c3aed" />,
            bg: '#f5f3ff',
            title: 'My Bookings',
            desc: 'View and manage your confirmed flight reservations',
            link: '/bookings',
            label: 'View Bookings',
            show: true,
        },
        {
            icon: <Luggage size={22} color="#0891b2" />,
            bg: '#ecfeff',
            title: 'Baggage Tracking',
            desc: 'Track your baggage status across all checkpoints in real time',
            link: '/baggage',
            label: 'Track Baggage',
            show: true,
        },
        {
            icon: <Settings size={22} color="#dc2626" />,
            bg: '#fef2f2',
            title: 'Flight Management',
            desc: 'Update flight prices, status, and operational details',
            link: '/flights',
            label: 'Manage Flights',
            show: role === 'Admin',
        },
    ].filter(c => c.show);

    return (
        <div style={styles.page}>
            <div style={styles.hero}>
                <div>
                    <p style={styles.welcome}>Welcome back</p>
                    <h1 style={styles.name}>{email}</h1>
                </div>
                <div style={{
                    ...styles.rolePill,
                    background: rc.bg,
                    color: rc.text,
                    border: `1px solid ${rc.border}`,
                }}>
                    {role}
                </div>
            </div>

            <div style={styles.grid}>
                {cards.map(card => (
                    <div key={card.title} style={styles.card}>
                        <div style={{ ...styles.iconBox, background: card.bg }}>
                            {card.icon}
                        </div>
                        <h3 style={styles.cardTitle}>{card.title}</h3>
                        <p style={styles.cardDesc}>{card.desc}</p>
                        <Link to={card.link} style={styles.cardLink}>
                            {card.label}
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                ))}
            </div>

            <div style={styles.infoBar}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>
                    <strong style={{ color: '#0f172a' }}>Access level:</strong>{' '}
                    {role === 'Passenger' && 'View flights, create bookings, track baggage'}
                    {role === 'Staff' && 'All Passenger permissions plus recording baggage scans'}
                    {role === 'Admin' && 'Full system access including flight management'}
                </span>
            </div>
        </div>
    );
}

const styles = {
    page: {
        padding: '32px',
        background: '#f8fafc',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    hero: {
        background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
        borderRadius: '16px',
        padding: '32px 36px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcome: { color: '#94a3b8', fontSize: '14px', margin: '0 0 6px' },
    name: { color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: 0 },
    rolePill: {
        padding: '8px 20px',
        borderRadius: '20px',
        fontWeight: '600',
        fontSize: '13px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '20px',
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
    },
    iconBox: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
    },
    cardTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 8px' },
    cardDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px' },
    cardLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: '#0284c7',
        fontSize: '13px',
        fontWeight: '600',
        textDecoration: 'none',
    },
    infoBar: {
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '14px 20px',
    },
};

export default Dashboard;