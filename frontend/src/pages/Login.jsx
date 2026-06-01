import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api';
import { Plane, Mail, Lock, AlertCircle } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await loginUser({ email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('email', email);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
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
                    <h1 style={styles.heroTitle}>
                        Your journey<br />starts here
                    </h1>
                    <p style={styles.heroSub}>
                        Smart airline management for passengers, staff, and operations teams worldwide.
                    </p>
                    <div style={styles.features}>
                        {['Real-time flight tracking', 'Instant booking confirmation', 'Live baggage updates'].map(f => (
                            <div key={f} style={styles.featureItem}>
                                <div style={styles.featureDot} />
                                <span>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={styles.right}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Sign in</h2>
                    <p style={styles.cardSub}>Access your AeroLink account</p>

                    <form onSubmit={handleLogin}>
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
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={styles.errorBox}>
                                <AlertCircle size={15} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" style={styles.btn} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p style={styles.footer}>
                        Don't have an account?{' '}
                        <Link to="/register" style={styles.footerLink}>Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        display: 'flex',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    left: {
        flex: 1,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
    },
    leftContent: { maxWidth: '420px' },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '48px',
    },
    logoText: {
        color: '#f1f5f9',
        fontSize: '24px',
        fontWeight: '700',
    },
    heroTitle: {
        color: '#f1f5f9',
        fontSize: '48px',
        fontWeight: '800',
        lineHeight: '1.1',
        marginBottom: '20px',
    },
    heroSub: {
        color: '#94a3b8',
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: '36px',
    },
    features: { display: 'flex', flexDirection: 'column', gap: '12px' },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#cbd5e1',
        fontSize: '15px',
    },
    featureDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#38bdf8',
        flexShrink: 0,
    },
    right: {
        width: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#f8fafc',
    },
    card: { width: '100%', maxWidth: '380px' },
    cardTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '8px',
    },
    cardSub: { color: '#64748b', fontSize: '15px', marginBottom: '32px' },
    field: { marginBottom: '20px' },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
    },
    inputWrap: { position: 'relative' },
    inputIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
    },
    input: {
        width: '100%',
        padding: '11px 12px 11px 38px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        background: 'white',
        boxSizing: 'border-box',
        outline: 'none',
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
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        marginBottom: '16px',
    },
    footer: { textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '14px' },
    footerLink: { color: '#0284c7', fontWeight: '600', textDecoration: 'none' },
};

export default Login;