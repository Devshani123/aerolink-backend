import { useState, useEffect } from 'react';
import { getAllBookings, cancelBooking } from '../api';
import { Calendar, Plane, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => { loadBookings(); }, []);

    const loadBookings = async () => {
        try {
            const res = await getAllBookings();
            const token = localStorage.getItem('token');
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = payload.userId;
            const role = payload.role;
            if (role === 'Admin' || role === 'Staff') {
                setBookings(res.data);
            } else {
                setBookings(res.data.filter(b => b.userId === currentUserId));
            }
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        setCancelling(bookingId);
        setMessage('');
        setError('');
        try {
            await cancelBooking(bookingId);
            setMessage(`Booking ${bookingId} cancelled. Seat has been released.`);
            loadBookings();
        } catch (err) {
            setError('Failed to cancel booking');
        } finally {
            setCancelling(null);
        }
    };

    if (loading) return (
        <div style={styles.loading}>
            <Calendar size={32} color="#94a3b8" />
            <p>Loading bookings...</p>
        </div>
    );

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2 style={styles.title}>My Bookings</h2>
                <p style={styles.subtitle}>
                    {bookings.length} reservation{bookings.length !== 1 ? 's' : ''}
                </p>
            </div>

            {error && (
                <div style={styles.errorBanner}>
                    <AlertCircle size={16} /><span>{error}</span>
                </div>
            )}
            {message && (
                <div style={styles.successBanner}>
                    <CheckCircle size={16} /><span>{message}</span>
                </div>
            )}

            {bookings.length === 0 ? (
                <div style={styles.empty}>
                    <Calendar size={48} color="#cbd5e1" />
                    <h3 style={{ color: '#64748b', margin: '16px 0 8px' }}>
                        No bookings yet
                    </h3>
                    <p style={{ color: '#94a3b8', margin: '0 0 20px' }}>
                        Your confirmed reservations will appear here
                    </p>
                    <a href="/flights" style={styles.emptyBtn}>Browse Flights</a>
                </div>
            ) : (
                <div style={styles.list}>
                    {bookings.map(booking => (
                        <div key={booking.bookingId} style={styles.card}>
                            <div style={styles.cardLeft}>
                                <div style={styles.bookingIdRow}>
                                    <span style={styles.bookingId}>
                                        {booking.bookingId}
                                    </span>
                                </div>
                                <div style={styles.meta}>
                                    <span style={styles.metaItem}>
                                        <Plane size={13} color="#94a3b8" />
                                        Flight {booking.flightId}
                                    </span>
                                    <span style={styles.metaItem}>
                                        <Clock size={13} color="#94a3b8" />
                                        {new Date(booking.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.cardRight}>
                                <div style={{
                                    ...styles.statusBadge,
                                    background: booking.status === 'Confirmed'
                                        ? '#f0fdf4' : '#fef2f2',
                                    color: booking.status === 'Confirmed'
                                        ? '#16a34a' : '#dc2626',
                                    border: `1px solid ${booking.status === 'Confirmed'
                                        ? '#bbf7d0' : '#fecaca'}`,
                                }}>
                                    {booking.status === 'Confirmed'
                                        ? <CheckCircle size={13} />
                                        : <XCircle size={13} />}
                                    {booking.status}
                                </div>

                                {booking.status === 'Confirmed' && (
                                    <button
                                        style={{
                                            ...styles.cancelBtn,
                                            opacity: cancelling === booking.bookingId
                                                ? 0.6 : 1
                                        }}
                                        onClick={() => handleCancel(booking.bookingId)}
                                        disabled={cancelling === booking.bookingId}
                                    >
                                        <X size={13} />
                                        {cancelling === booking.bookingId
                                            ? 'Cancelling...' : 'Cancel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    page: {
        padding: '32px', background: '#f8fafc', minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    loading: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh', gap: '12px', color: '#94a3b8',
    },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' },
    subtitle: { color: '#64748b', fontSize: '14px', margin: 0 },
    errorBanner: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#fef2f2', border: '1px solid #fecaca',
        color: '#dc2626', padding: '12px 16px', borderRadius: '8px',
        marginBottom: '20px', fontSize: '14px',
    },
    successBanner: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        color: '#16a34a', padding: '12px 16px', borderRadius: '8px',
        marginBottom: '20px', fontSize: '14px',
    },
    empty: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '80px 40px',
        background: 'white', borderRadius: '12px',
        border: '1px solid #e2e8f0', textAlign: 'center',
    },
    emptyBtn: {
        padding: '10px 24px', background: '#0f172a', color: 'white',
        borderRadius: '8px', textDecoration: 'none',
        fontSize: '14px', fontWeight: '600',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    card: {
        background: 'white', borderRadius: '10px', padding: '18px 20px',
        border: '1px solid #e2e8f0', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    },
    cardLeft: {},
    cardRight: {
        display: 'flex', alignItems: 'center', gap: '10px'
    },
    bookingIdRow: { marginBottom: '6px' },
    bookingId: { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
    meta: { display: 'flex', gap: '16px' },
    metaItem: {
        display: 'flex', alignItems: 'center', gap: '5px',
        color: '#64748b', fontSize: '13px',
    },
    statusBadge: {
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', borderRadius: '20px',
        fontSize: '12px', fontWeight: '600',
    },
    cancelBtn: {
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', background: '#fef2f2',
        color: '#dc2626', border: '1px solid #fecaca',
        borderRadius: '6px', fontSize: '12px',
        fontWeight: '600', cursor: 'pointer',
    },
};

export default Bookings;