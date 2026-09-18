import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      {/* Partie bleue */}
      <section className="dashboard-hero">
        <h1>Bienvenue sur DZShop</h1>

        <p>
          Le meilleur de l'électronique, livré partout en Algérie.
        </p>

        <button className="discover-btn">
          Découvrir nos produits
        </button>
      </section>

      {/* Contenu */}
      <main className="dashboard-content">

        {/* Services */}
        <section className="dashboard-features">

          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h2>Livraison 58 wilayas</h2>
            <p>Gratuite dès 10 000 DZD d'achat.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h2>Paiement à la livraison</h2>
            <p>Vous payez à la réception.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">↩️</div>
            <h2>Retour sous 7 jours</h2>
            <p>Produit non conforme ? On le reprend.</p>
          </div>

        </section>

        {/* Produits vedettes */}
        <section className="products-section">

          <div className="products-header">
            <h2>Produits vedettes</h2>
           
          </div>
          <button className="products-btn">
              Voir tous les produits
            </button>
        </section>

      </main>

    </div>
  );
}

export default Dashboard;