import { useState } from 'react';
import type { User } from '../types/User';
import { Button, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/RegisterPageStyle.css';
import useAuth from '../store/authStore';

const RegisterPage = () => {
    const [user, setUser] = useState<User>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const setToken = useAuth((state) => state.setToken);
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const register = () => {
        if (user.password !== confirmPassword) {
            toast.error('A két jelszó nem egyezik!');
            return;
        }

        apiClient
            .post('/register', user)
            .then((res) => {
                toast.success('Sikeres regisztráció!');
                navigate('/');
                setToken(res.data.token);
            })
            .catch(() => toast.error('Sikertelen regisztráció!'));
    };

    return (
        <div className="register-wrapper">
            <Card className="register-card">
                <Card.Body>
                    <button className="back-home-button" onClick={() => navigate('/')}>
                        ← Főoldal
                    </button>

                    <h2 className="register-title">Regisztráció</h2>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control
                                placeholder="Vezetéknév"
                                value={user.firstName}
                                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control
                                placeholder="Keresztnév"
                                value={user.lastName}
                                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email cím"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Jelszó"
                                value={user.password}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Control
                                type="password"
                                placeholder="Jelszó megerősítése"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') register();
                                }}
                            />
                        </Form.Group>
                        <p>
                            Van már fiókod? <Link to={'/login'}>Itt bejelentkezhetsz!</Link>
                        </p>

                        <Button className="register-button" onClick={register}>
                            Regisztráció
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default RegisterPage;
