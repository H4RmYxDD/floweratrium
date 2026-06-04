import { useState } from 'react';
import type { User } from '../types/User';
import { Button, Card, Form } from 'react-bootstrap';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import '../styles/LoginPageStyle.css';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../store/authStore';

const LoginPage = () => {
    const [user, setUser] = useState<User>({
        email: '',
        password: '',
    });
    //test-commit
    const setToken = useAuth((state) => state.setToken);
    const setUserId = useAuth((state) => state.setUserId);

    const navigate = useNavigate();

    const login = () => {
        apiClient
            .post('/login', user)
            .then((res) => {
                toast.success('Sikeres bejelentkezés!');
                navigate('/');
                setToken(res.data.token);
                setUserId(res.data.user.userId);
            })
            .catch(() => toast.error('Hibás email vagy jelszó!'));
    };

    return (
        <div className="login-wrapper">
            <Card className="login-card">
                <Card.Body>
                    <button className="back-home-button" onClick={() => navigate('/')}>
                        ← Főoldal
                    </button>

                    <h2 className="login-title">Bejelentkezés</h2>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email cím"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Control
                                type="password"
                                placeholder="Jelszó"
                                value={user.password}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') login();
                                }}
                            />
                        </Form.Group>

                        <p>
                            Nincs még fiókod? <Link to={'/register'}>Itt regisztrálhatsz!</Link>
                        </p>
                        <Button className="login-button" onClick={login}>
                            Bejelentkezés
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default LoginPage;
