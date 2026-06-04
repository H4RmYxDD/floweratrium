import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
    const navigate = useNavigate();
    return (
        <Container className="privacy-policy-page-container">
            <div>
                <button className="back-home-button" onClick={() => navigate('/')}>
                    ← Főoldal
                </button>
                <h1>Adatvédelmi Szabályzat</h1>
                <p>
                    Ez az adatvédelmi szabályzat leírja, hogyan gyűjtjük, használjuk és védjük a
                    személyes adataidat a Virágátrium alkalmazásban.
                </p>

                <h2>1. Adatgyűjtés</h2>
                <p>
                    Az alkalmazás használata során bizonyos személyes adatokat gyűjthetünk, például:
                </p>
                <ul>
                    <li>Név</li>
                    <li>Email cím</li>
                    <li>Felhasználói fiók adatai</li>
                    <li>Használati adatok</li>
                </ul>

                <h2>2. Adatfelhasználás</h2>
                <p>A gyűjtött adatokat a következő célokra használjuk:</p>
                <ul>
                    <li>Szolgáltatás nyújtása és fejlesztése</li>
                    <li>Kommunikáció a felhasználókkal</li>
                    <li>Biztonság és csalás megelőzése</li>
                </ul>

                <h2>3. Adatvédelem</h2>
                <p>
                    Elkötelezettek vagyunk a személyes adatok védelme iránt, és megfelelő technikai
                    és szervezési intézkedéseket alkalmazunk az adatok biztonságának biztosítása
                    érdekében.
                </p>

                <h2>4. Adatmegosztás</h2>
                <p>
                    Nem osztjuk meg személyes adataidat harmadik felekkel, kivéve, ha jogi
                    kötelezettségünk van rá, vagy ha a szolgáltatás nyújtásához szükséges.
                </p>

                <h2>5. Jogok</h2>
                <p>
                    Jogod van hozzáférni, helyesbíteni vagy törölni a személyes adataidat. Kérjük,
                    lépj kapcsolatba velünk, ha szeretnéd gyakorolni ezeket a jogokat.
                </p>

                <h2>6. Kapcsolat</h2>
                <p>
                    Ha bármilyen kérdésed van az adatvédelmi szabályzatunkkal kapcsolatban, kérjük,
                    lépj kapcsolatba velünk a következő email címen:{' '}
                    <a href="mailto:viragatrium.morahalom@gmail.com">
                        viragatrium.morahalom@gmail.com
                    </a>
                </p>
            </div>
        </Container>
    );
};

export default PrivacyPolicyPage;
