import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '6rem', color: '#ef4444', margin: '0' }}>404</h1>
      <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Page introuvable</h2>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Désolé, la page que vous recherchez n'existe pas.</p>
      <Link to="/" style={{ padding: '12px 24px', background: '#2563eb', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>
        Retour à l'accueil
      </Link>
    </div>
  );
}