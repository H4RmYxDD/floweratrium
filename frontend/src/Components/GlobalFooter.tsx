import { Link } from 'react-router-dom';
import '../styles/GlobalFooterStyle.css';

const GlobalFooter = () => {
    return (
        <footer className="homepage-footer">
            <div className="footer-inner">
                <div className="footer-section">
                    <h5>Virágátrium</h5>
                    <p>
                        Friss virágok és csokrok,
                        <br />
                        gyors kiszállítással.
                    </p>
                    <p>📧 viragatrium.morahalom@gmail.com</p>
                    <p>📞 +36 1 234 5678</p>
                </div>

                <div className="footer-section">
                    <h5>Jogi információk</h5>
                    <ul>
                        <li>
                            <Link to="/privacy">Adatvédelmi nyilatkozat</Link>
                        </li>
                        <li>
                            <Link to="/terms">ÁSZF</Link>
                        </li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h5>Készítők</h5>
                    <ul>
                        <li>
                            <a
                                href="https://github.com/namost1"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Levente
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://github.com/kristofhodi"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Kristóf
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://github.com/H4RmYxDD"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Balázs
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 Virágátrium. Minden jog fenntartva.</p>
            </div>
        </footer>
    );
};

export default GlobalFooter;
