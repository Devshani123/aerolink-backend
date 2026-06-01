import { useState } from 'react';
import { scanBaggage, getBaggageByBooking } from '../api';
import { getRole } from '../useRole';
import { Search, Package, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

function Baggage() {
    const role = getRole();
    const [bookingId, setBookingId] = useState('');
    const [records, setRecords] = useState([]);
    const [trackError, setTrackError] = useState('');
    const [scanBookingId, setScanBookingId] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('');
    const [scanMsg, setScanMsg] = useState('');
    const [scanError, setScanError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setTrackError(''); setRecords([]);
        try {
            const res = await getBaggageByBooking(bookingId);
            setRecords(res.data);
        } catch {
            setTrackError('No baggage records found for this booking ID');
        }
    };

    const handleScan = async (e) => {
        e.preventDefault();
        setScanMsg(''); setScanError('');
        try {
            await scanBaggage({ bookingId: scanBookingId, location, status });
            setScanMsg('Scan recorded successfully');
            setScanBookingId(''); setLocation(''); setStatus('');
        } catch (err) {
            setScanError(err.response?.data?.error || 'Scan failed');
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2 style={styles.title}>Baggage Tracking</h2>
                <p style={styles.subtitle}>
                    {role === 'Passenger'
                        ? 'Track your baggage using your booking ID'
                        : 'Track baggage and record checkpoint scans'}
                </p>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardIcon}>
                            <Search size={18} color="#0284c7" />
                        </div>
                        <div>
                            <h3 style={styles.cardTitle}>Track Baggage</h3>
                            <p style={styles.cardSub}>Enter your booking ID</p>
                        </div>
                    </div>

                    <form onSubmit={handleTrack}>
                        <input
                            style={styles.input}
                            placeholder="e.g. BK-123456"
                            value={bookingId}
                            onChange={e => setBookingId(e.target.value)}
                            required
                        />
                        {trackError && (
                            <div style={styles.errorBox}>
                                <AlertCircle size={14} /><span>{trackError}</span>
                            </div>
                        )}
                        <button type="submit" style={styles.btn}>Track Baggage</button>
                    </form>

                    {records.length > 0 && (
                        <div style={styles.timeline}>
                            <p style={styles.timelineTitle}>
                                {records.length} checkpoint{records.length !== 1 ? 's' : ''} recorded
                            </p>
                            {records
                                .sort((a, b) => new Date(a.time) - new Date(b.time))
                                .map((r, i) => (
                                    <div key={i} style={styles.scanRow}>
                                        <div style={{
                                            ...styles.dot,
                                            background: i === records.length - 1 ? '#0284c7' : '#cbd5e1'
                                        }} />
                                        <div style={styles.scanInfo}>
                                            <div style={styles.scanLocation}>
                                                <MapPin size={12} color="#94a3b8" />
                                                {r.location}
                                            </div>
                                            <div style={styles.scanStatus}>{r.status}</div>
                                            <div style={styles.scanTime}>
                                                <Clock size={11} color="#94a3b8" />
                                                {new Date(r.time).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {(role === 'Staff' || role === 'Admin') && (
                    <div style={{ ...styles.card, borderTop: '3px solid #d97706' }}>
                        <div style={styles.cardHeader}>
                            <div style={{ ...styles.cardIcon, background: '#fffbeb' }}>
                                <Package size={18} color="#d97706" />
                            </div>
                            <div>
                                <h3 style={styles.cardTitle}>Record Scan</h3>
                                <p style={{ ...styles.cardSub, color: '#d97706' }}>
                                    Staff / Admin only
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleScan}>
                            <input
                                style={styles.input}
                                placeholder="Booking ID"
                                value={scanBookingId}
                                onChange={e => setScanBookingId(e.target.value)}
                                required
                            />
                            <select
                                style={styles.input}
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                required
                            >
                                <option value="">Select checkpoint location</option>
                                <option>Check-in Counter</option>
                                <option>Security</option>
                                <option>Loading Bay</option>
                                <option>On Aircraft</option>
                                <option>Arrived at Destination</option>
                                <option>Baggage Carousel</option>
                            </select>
                            <select
                                style={styles.input}
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                required
                            >
                                <option value="">Select status</option>
                                <option>Checked In</option>
                                <option>Security Cleared</option>
                                <option>Loaded onto Aircraft</option>
                                <option>In Transit</option>
                                <option>Arrived</option>
                                <option>Ready for Collection</option>
                            </select>

                            {scanMsg && (
                                <div style={styles.successBox}>
                                    <CheckCircle size={14} /><span>{scanMsg}</span>
                                </div>
                            )}
                            {scanError && (
                                <div style={styles.errorBox}>
                                    <AlertCircle size={14} /><span>{scanError}</span>
                                </div>
                            )}

                            <button type="submit"
                                style={{ ...styles.btn, background: '#d97706' }}>
                                Record Scan
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        padding: '32px', background: '#f8fafc', minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' },
    subtitle: { color: '#64748b', fontSize: '14px', margin: 0 },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
    },
    card: {
        background: 'white', borderRadius: '12px', padding: '24px',
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    cardHeader: { display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '20px' },
    cardIcon: {
        width: '40px', height: '40px', borderRadius: '10px',
        background: '#eff6ff', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    cardTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 2px' },
    cardSub: { fontSize: '12px', color: '#94a3b8', margin: 0 },
    input: {
        width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
        borderRadius: '8px', fontSize: '14px', marginBottom: '10px',
        boxSizing: 'border-box', background: '#fafafa', color: '#0f172a',
    },
    btn: {
        width: '100%', padding: '11px', background: '#0f172a',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '4px',
    },
    successBox: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        color: '#16a34a', padding: '9px 12px', borderRadius: '6px',
        fontSize: '13px', marginBottom: '8px',
    },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#fef2f2', border: '1px solid #fecaca',
        color: '#dc2626', padding: '9px 12px', borderRadius: '6px',
        fontSize: '13px', marginBottom: '8px',
    },
    timeline: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' },
    timelineTitle: { fontSize: '12px', fontWeight: '600', color: '#94a3b8', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    scanRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
    dot: { width: '10px', height: '10px', borderRadius: '50%', marginTop: '4px', flexShrink: 0 },
    scanInfo: {},
    scanLocation: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '2px' },
    scanStatus: { fontSize: '12px', color: '#16a34a', fontWeight: '500', marginBottom: '2px' },
    scanTime: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8' },
};

export default Baggage;