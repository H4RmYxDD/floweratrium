import express from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/checkAdmin.js';
import fs from 'fs';

const router = express.Router();

router.post('/upload', auth, isAdmin, async (req, res) => {
    try {
        const { imageBase64, filename } = req.body;
        if (!imageBase64 || !filename) {
            return res.status(400).json({ message: 'Image data and filename are required' });
        }
        const buffer = Buffer.from(imageBase64, 'base64');
        const sanitizedFilename = `product_${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        fs.writeFileSync(`./images/${sanitizedFilename}`, buffer);

        const imageUrl = `${sanitizedFilename}`;
        return res.status(201).json({ imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;