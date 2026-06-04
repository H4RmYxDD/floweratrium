import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const TCPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#e6e6fa', padding: '2rem' }}>
            <Container>
                <button className="back-home-button" onClick={() => navigate('/')}>
                    ← Főoldal
                </button>
                <h1>Felhasználási feltételek</h1>
                <p>
                    Ez a dokumentum a Virágátrium weboldal használatának feltételeit tartalmazza.
                    Kérjük, olvassa el figyelmesen ezeket a feltételeket, mielőtt használja a
                    weboldalt.
                </p>
                <h2>1. Általános rendelkezések</h2>
                <p>
                    A Virágátrium egy online platform, amely lehetővé teszi a felhasználók számára,
                    hogy virágokat vásároljanak és rendeljenek. A weboldal használatával Ön
                    elfogadja ezeket a feltételeket, valamint az adatvédelmi szabályzatot.
                </p>
                <h2>2. Szolgáltatások</h2>
                <p>
                    A Virágátrium különféle virágokat és virágcsokrokat kínál, amelyeket a
                    felhasználók megvásárolhatnak. A szolgáltatások részletes leírását a weboldalon
                    található termékeknél találja meg.
                </p>
                <h2>3. Felhasználói fiók</h2>
                <p>
                    A weboldal használatához regisztráció szükséges. A felhasználók kötelesek helyes
                    és aktuális információkat megadni a regisztráció során, és felelősek a fiókjuk
                    biztonságáért.
                </p>
                <h2>4. Fizetés</h2>
                <p>
                    A vásárlások online fizetéssel történnek. A fizetési módok és feltételek a
                    weboldalon találhatók.
                </p>
                <h2>5. Szállítás</h2>
                <p>
                    A szállítás a rendelés leadása után történik. A szállítási költségek és
                    feltételek a weboldalon találhatók.
                </p>
            </Container>
        </div>
    );
};

export default TCPage;