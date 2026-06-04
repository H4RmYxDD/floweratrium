import express from 'express';
import * as User from '../data/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/checkAdmin.js';

const router = express.Router();

router.get('/me', auth, async (req, res) => {
    res.json(req.user);
});

router.get('/users', auth, isAdmin, async (req, res) => {
    const users = await User.getUsers();
    res.json(users);
});

router.get('/users/:id', auth, isAdmin, async (req, res) => {
    const id = req.params.id;
    const user = await User.getUserByUserId(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
});
//test commit

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password)
            return res.status(400).json({ message: 'All fields are required.' });

        const existingUser = await User.getUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: 'User already exists.' });

        const password_hash = await bcrypt.hash(password, 10);
        await User.createUser(firstName, lastName, email, password_hash);

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required.' });

        const user = await User.getUserByEmail(email);
        if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials.' });

        const token = jwt.sign(
            { userId: user.userId, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
        );

        res.json({
            message: 'Login successful.',
            token,
            user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Error during login.' });
    }
});

export default router;
