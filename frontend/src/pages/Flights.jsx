import { useState, useEffect } from 'react';
import { getAllFlights, createBooking, updateFlight } from '../api';
import { getRole } from '../useRole';
import { Plane, Clock, MapPin, Tag, Users, Settings, CheckCircle, AlertCircle } from 'lucide-react';

function Flights() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [editingFlight, setEditingFlight] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const role = getRole();

    useEffect(() => { loadFlights(); }, []);

    const loadFlights = async () => {
        try {
            const res = await getAllFlights();
            setFlights(res.data);
        } catch (err) {
            setError('Failed to load flights');
        } finally {
            setLoading(false);
        }
    };

    const cantBook = (flight) =>
        flight.seats === 0 ||
        flight.status === 'Cancelled' ||
        flight.status === 'Departed' ||
        flight.status === 'Boarding' ||
        flight.status === 'Fully Booked';

    const bookLabel = (flight) => {
        if (flight.seats === 0 || flight.status === 'Fully Booked') return 'Fully Booked';
        if (flight.status === 'Cancelled') return 'Cancelled';
        if (flight.status === 'Departed') return 'Departed';
        if (flight.status === 'Boarding') return 'Now Boarding';
        return 'Book Now';
    };

    const handleBook = async (flightId) => {
        setMessage(''); setError('');
        try {
            const res = await createBooking({ flightId });
            setMessage(`Booking confirmed — ${res.data.booking.bookingId}`);
            loadFlights();
        } catch (err) {
            setError(err.response?.data?.error || 'Booking failed');
        }
    };

    const handleUpdate = async (flightId) => {
        setMessage(''); setError('');
        try {
            const data = {};
            if (newStatus) data.status = newStatus;
            if (newPrice) data.price = parseFloat(newPrice);
            await updateFlight(flightId, data);
            setMessage(`Flight ${flightId} updated successfully`);
            setEditingFlight(null);
            setNewStatus(''); setNewPrice('');
            loadFlights();
        } catch (err) {
            setError('Update failed');
        }
    };

    const statusColor = (status) => {
        const map = {
            'On Time': '#16a34a',
            'Delayed': '#d97706',
            'Cancelled': '#dc2626',
            'Boarding': '#7c3aed',
            'Departed': '#64748b',
            'Fully Booked': '#dc2626',
        };
        return map[status] || '#64748b';
    };

    if (loading) return (
        <div style={styles.loading}>
            <Plane size={32} color="#94a3b8" />
            <p>Loading flights...</p>
        </div>
    );

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>
                        {role === 'Admin' ? 'Flight Management' : 'Available Flights'}
                    </h2>
                    <p style={styles.subtitle}>
                        {role === 'Admin'
                            ? 'Manage flight status and pricing'
                            : `${flights.length} flights available`}
                    </p>
                </div>
            </div>

            {message && (
                <div style={styles.successBanner}>
                    <CheckCircle size={16} />
                    <span>{message}</span>
                </div>
            )}
            {error && (
                <div style={styles.errorBanner}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <div style={styles.grid}>
                {flights.map(flight => (
                    <div key={flight.id} style={styles.card}>
                        <div style={styles.cardTop}>
                            <div style={styles.routeRow}>
                                <div style={styles.airport}>
                                    <div style={styles.airportCode}>{flight.from}</div>
                                </div>
                                <div style={styles.planeIcon}>
                                    <Plane size={18} color="#38bdf8" />
                                    <div style={styles.routeLine} />
                                </div>
                                <div style={styles.airport}>
                                    <div style={styles.airportCode}>{flight.to}</div>
                                </div>
                            </div>
                            <span style={{
                                ...styles.statusBadge,
                                background: statusColor(flight.status) + '18',
                                color: statusColor(flight.status),
                                border: `1px solid ${statusColor(flight.status)}30`,
                            }}>
                                {flight.status}
                            </span>
                        </div>

                        <div style={styles.details}>
                            <div style={styles.detailRow}>
                                <Tag size={13} color="#94a3b8" />
                                <span style={styles.detailLabel}>Flight</span>
                                <span style={styles.detailValue}>{flight.id}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <Clock size={13} color="#94a3b8" />
                                <span style={styles.detailLabel}>Date</span>
                                <span style={styles.detailValue}>{flight.date}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <MapPin size={13} color="#94a3b8" />
                                <span style={styles.detailLabel}>Price</span>
                                <span style={{ ...styles.detailValue, fontWeight: '700', color: '#0f172a' }}>
                                    ${flight.price}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <Users size={13} color="#94a3b8" />
                                <span style={styles.detailLabel}>Seats</span>
                                <span style={{
                                    ...styles.detailValue,
                                    color: flight.seats > 10 ? '#16a34a' : flight.seats > 0 ? '#d97706' : '#dc2626',
                                    fontWeight: '600',
                                }}>
                                    {flight.seats > 0 ? `${flight.seats} available` : 'Sold out'}
                                </span>
                            </div>
                        </div>

                        <div style={styles.cardActions}>
                            {(role === 'Passenger' || role === 'Staff' || role === 'Admin') && (
                                <button
                                    style={{
                                        ...styles.bookBtn,
                                        background: cantBook(flight) ? '#e2e8f0' : '#0f172a',
                                        color: cantBook(flight) ? '#94a3b8' : 'white',
                                        cursor: cantBook(flight) ? 'not-allowed' : 'pointer',
                                    }}
                                    onClick={() => !cantBook(flight) && handleBook(flight.id)}
                                    disabled={cantBook(flight)}
                                >
                                    {bookLabel(flight)}
                                </button>
                            )}

                            {role === 'Admin' && (
                                <button
                                    style={styles.editBtn}
                                    onClick={() => setEditingFlight(
                                        editingFlight === flight.id ? null : flight.id
                                    )}
                                >
                                    <Settings size={14} />
                                    {editingFlight === flight.id ? 'Close' : 'Edit'}
                                </button>
                            )}
                        </div>

                        {editingFlight === flight.id && (
                            <div style={styles.editPanel}>
                                <p style={styles.editTitle}>Update Flight</p>
                                <select
                                    style={styles.editInput}
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                >
                                    <option value="">Keep current status</option>
                                    <option>On Time</option>
                                    <option>Delayed</option>
                                    <option>Boarding</option>
                                    <option>Departed</option>
                                    <option>Cancelled</option>
                                    <option>Fully Booked</option>
                                </select>
                                <input
                                    style={styles.editInput}
                                    type="number"
                                    placeholder={`New price (current: $${flight.price})`}
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                />
                                <button
                                    style={styles.saveBtn}
                                    onClick={() => handleUpdate(flight.id)}
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                ))}
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
    loading: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh', gap: '12px', color: '#94a3b8',
    },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' },
    subtitle: { color: '#64748b', fontSize: '14px', margin: 0 },
    successBanner: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        color: '#16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
        fontSize: '14px',
    },
    errorBanner: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#fef2f2', border: '1px solid #fecaca',
        color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
        fontSize: '14px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    cardTop: {
        padding: '20px 20px 16px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    routeRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    airport: {},
    airportCode: { fontSize: '22px', fontWeight: '800', color: '#0f172a' },
    planeIcon: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    routeLine: { width: '40px', height: '1px', background: '#e2e8f0' },
    statusBadge: {
        fontSize: '11px', fontWeight: '600', padding: '4px 10px',
        borderRadius: '20px', whiteSpace: 'nowrap',
    },
    details: { padding: '16px 20px' },
    detailRow: {
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '8px',
    },
    detailLabel: { color: '#94a3b8', fontSize: '12px', flex: 1 },
    detailValue: { color: '#374151', fontSize: '13px', fontWeight: '500' },
    cardActions: {
        padding: '12px 20px 16px',
        display: 'flex', gap: '8px',
    },
    bookBtn: {
        flex: 1, padding: '10px', border: 'none',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600',
    },
    editBtn: {
        padding: '10px 14px', background: '#f1f5f9',
        border: '1px solid #e2e8f0', borderRadius: '8px',
        cursor: 'pointer', fontSize: '13px', color: '#374151',
        display: 'flex', alignItems: 'center', gap: '6px',
    },
    editPanel: {
        padding: '16px 20px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
    },
    editTitle: { fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 12px' },
    editInput: {
        width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
        borderRadius: '6px', fontSize: '13px', marginBottom: '8px',
        boxSizing: 'border-box', background: 'white',
    },
    saveBtn: {
        width: '100%', padding: '9px', background: '#16a34a',
        color: 'white', border: 'none', borderRadius: '6px',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    },
};

export default Flights;