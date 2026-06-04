import express from 'express';
import * as OrderItem from '../data/orderItem.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/order-items/:orderId', auth, async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) return res.status(400).json({ message: 'Invalid orderId' });

    const items = await OrderItem.getOrderItemsByOrderId(orderId);
    res.json(items);
});

export default router;
