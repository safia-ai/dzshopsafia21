import { NavLink } from "react-router-dom";
function Navbar() {
    return (
        <nav className="bar-navigation">

            <div className="logo">
                🛒 DZSHOP
            </div>
            <ul className="liste">
                <li>
                    <NavLink className="nav-link"to="/">Accueil </NavLink>
                </li>
                <li>
                    <NavLink className="nav-link"to="/products">Produits </NavLink>
                </li>
            </ul>
            <div className="buttons">
            <button type="button" className="btn btn-primary position-relative">
             🛒 Panier
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            99+
           <span className="visually-hidden">unread messages</span>
  </span>
</button>
               <button type="button" className="btn btn-primary">Connexion</button>
            </div>

        </nav>
    );
}

export default Navbar;