import './footer.css';

function Piedpage() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>DZSHOP</h3>
          <p>Votre boutique d'électronique en ligne. Livraison dans les 58 wilayas.</p>
        </div>

        <div className="footer-links">
          <h4>Navigation</h4>
          <ul>
            <li><a link="#accueil">Accueil</a></li>
            <li><a link="#produits">Produits</a></li>
            <li><a link="#dashboard">Dashboard</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📍 Skikda, Algérie</p>
          <p>📞 0555 12 34 56</p>
          <p>✉️ contact@dzshop.dz</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 DZShop — Tous droits réservés</p>
      </div>
    </footer>
  );
}

export default Piedpage;