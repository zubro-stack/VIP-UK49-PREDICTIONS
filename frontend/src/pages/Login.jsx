import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const inputStyle = {
  padding: '11px 12px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--b)',
  background: 'var(--s2)',
  color: 'var(--t)',
  fontSize: 14,
  width: '100%',
};

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, var(--v1l) 0%, var(--bg) 55%)',
      }}
    >
      <Card style={{ width: 360, padding: 'var(--sp-6)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--sp-5)' }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--r-md)',
              background: 'var(--v1l)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              marginBottom: 'var(--sp-3)',
            }}
          >
            🎱
          </span>
          <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>UK49s Predictions</h1>
          <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: 0 }}>Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && (
            <div
              style={{
                background: 'var(--rdl)',
                color: 'var(--rd)',
                fontSize: 12.5,
                fontWeight: 600,
                padding: '8px 12px',
                borderRadius: 'var(--r-sm)',
              }}
            >
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: 4, padding: '11px 18px' }}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
