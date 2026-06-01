import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';
import { Plane, Mail, Lock, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Passenger');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await registerUser({ email, password, role });
            setSuccess('Account created successfully! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.left}>
                <div style={styles.leftContent}>
                    <div style={styles.logoRow}>
                        <Plane size={32} color="#38bdf8" />
                        <span style={styles.logoText}>AeroLink</span>
                    </div>
                    <h1 style={styles.heroTitle}>Join AeroLink today</h1>
                    <p style={styles.heroSub}>
                        Create your account and get access to real-time flight information, booking management, and live baggage tracking.
                    </p>
                </div>
            </div>

            <div style={styles.right}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Create account</h2>
                    <p style={styles.cardSub}>Fill in your details to get started</p>

                    <form onSubmit={handleRegister}>
                        <div style={styles.field}>
                            <label style={styles.label}>Email address</label>
                            <div style={styles.inputWrap}>
                                <Mail size={16} color="#94a3b8" style={styles.inputIcon} />
                                <input
                                    style={styles.input}
                                    type="email"
                                    placeholder="you@aerolink.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputWrap}>
                                <Lock size={16} color="#94a3b8" style={styles.inputIcon} />
                                <input
                                    style={styles.input}
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Account type</label>
                            <div style={styles.inputWrap}>
                                <UserCheck size={16} color="#94a3b8" style={styles.inputIcon} />
                                <select
                                    style={styles.input}
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                >
                                    <option value="Passenger">Passenger</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div style={styles.errorBox}>
                                <AlertCircle size={15} />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div style={styles.successBox}>
                                <CheckCircle size={15} />
                                <span>{success}</span>
                            </div>
                        )}

                        <button type="submit" style={styles.btn} disabled={loading}>
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p style={styles.footer}>
                        Already have an account?{' '}
                        <Link to="/login" style={styles.footerLink}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { display: 'flex', minHeight: '100vh' },
    left: {
        flex: 1,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
    },
    leftContent: { maxWidth: '420px' },
    logoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
    logoText: { color: '#f1f5f9', fontSize: '24px', fontWeight: '700' },
    heroTitle: { color: '#f1f5f9', fontSize: '42px', fontWeight: '800', marginBottom: '20px' },
    heroSub: { color: '#94a3b8', fontSize: '16px', lineHeight: '1.6' },
    right: {
        width: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#f8fafc',
    },
    card: { width: '100%', maxWidth: '380px' },
    cardTitle: { fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' },
    cardSub: { color: '#64748b', fontSize: '15px', marginBottom: '32px' },
    field: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
    inputWrap: { position: 'relative' },
    inputIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' },
    input: {
        width: '100%',
        padding: '11px 12px 11px 38px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        background: 'white',
        boxSizing: 'border-box',
        color: '#0f172a',
    },
    btn: {
        width: '100%',
        padding: '12px',
        background: '#0f172a',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px',
    },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#fef2f2', border: '1px solid #fecaca',
        color: '#dc2626', padding: '10px 14px', borderRadius: '8px',
        fontSize: '13px', marginBottom: '16px',
    },
    successBox: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        color: '#16a34a', padding: '10px 14px', borderRadius: '8px',
        fontSize: '13px', marginBottom: '16px',
    },
    footer: { textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '14px' },
    footerLink: { color: '#0284c7', fontWeight: '600', textDecoration: 'none' },
};

export default Register;